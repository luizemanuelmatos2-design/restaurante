import express from 'express'
import cors from 'cors'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const app = express()
const BACKEND_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_DIR = path.resolve(BACKEND_DIR, '..')
const PORT = process.env.PORT || 3000
const USERS_FILE = path.join(BACKEND_DIR, 'data', 'users.json')
const RESTAURANT_FILE = path.join(BACKEND_DIR, 'data', 'restaurant.json')
const SITE_DIR = path.join(PROJECT_DIR, 'dist')

const initialStore = {
  menu: [
    { id: 'salada-estacao', nome: 'Salada da estação', descricao: 'Folhas, legumes grelhados, castanhas e vinagrete de ervas.', categoria: 'Entradas', preco: 28, imagem: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85', disponivel: true },
    { id: 'pao-milho', nome: 'Pão de milho', descricao: 'Assado na brasa, manteiga de garrafa e melado da casa.', categoria: 'Entradas', preco: 22, imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85', disponivel: true },
    { id: 'carne-brasa', nome: 'Carne na brasa', descricao: 'Corte do dia, purê de mandioca e vinagrete de pimenta.', categoria: 'Pratos principais', preco: 62, imagem: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85', disponivel: true },
    { id: 'peixe-litoral', nome: 'Peixe do litoral', descricao: 'Pesca sustentável, arroz cremoso e molho de tucupi.', categoria: 'Pratos principais', preco: 58, imagem: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85', disponivel: true },
    { id: 'doce-leite', nome: 'Doce de leite queimado', descricao: 'Crocante de castanha e sorvete de queijo meia cura.', categoria: 'Sobremesas', preco: 24, imagem: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85', disponivel: true },
    { id: 'chocolate-cafe', nome: 'Chocolate e café', descricao: 'Creme intenso, farofa de café e flor de sal.', categoria: 'Sobremesas', preco: 26, imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85', disponivel: true },
  ],
  reservas: [],
  pedidos: [],
  avaliacoes: [],
}

let writeQueue = Promise.resolve()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

function atomicWrite(file, data) {
  const temporaryFile = `${file}.${crypto.randomUUID()}.tmp`
  return fs.writeFile(temporaryFile, JSON.stringify(data, null, 2))
    .then(() => fs.rename(temporaryFile, file))
}

async function readStore() {
  try {
    return JSON.parse(await fs.readFile(RESTAURANT_FILE, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    await fs.mkdir(path.dirname(RESTAURANT_FILE), { recursive: true })
    await atomicWrite(RESTAURANT_FILE, initialStore)
    return structuredClone(initialStore)
  }
}

function updateStore(updater) {
  const operation = writeQueue.then(async () => {
    const store = await readStore()
    const result = updater(store)
    await atomicWrite(RESTAURANT_FILE, store)
    return result
  })
  writeQueue = operation.catch(() => {})
  return operation
}

async function readUsers() {
  try {
    return JSON.parse(await fs.readFile(USERS_FILE, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true })
    await atomicWrite(USERS_FILE, [])
    return []
  }
}

function updateUsers(updater) {
  const operation = writeQueue.then(async () => {
    const users = await readUsers()
    const result = updater(users)
    await atomicWrite(USERS_FILE, users)
    return result
  })
  writeQueue = operation.catch(() => {})
  return operation
}

function badRequest(res, message) {
  return res.status(400).json({ erro: message })
}

function validateMenuItem(body) {
  if (!body.nome?.trim() || !body.descricao?.trim() || !body.categoria?.trim()) return 'Nome, descrição e categoria são obrigatórios.'
  if (!Number.isFinite(Number(body.preco)) || Number(body.preco) <= 0) return 'O preço deve ser um número maior que zero.'
  return null
}

function validateReservation(body) {
  if (!body.nome?.trim() || !body.email?.trim() || !body.telefone?.trim() || !body.data || !body.horario) return 'Nome, e-mail, telefone, data e horário são obrigatórios.'
  if (!/^\S+@\S+\.\S+$/.test(body.email)) return 'Informe um e-mail válido.'
  if (body.telefone.replace(/\D/g, '').length < 10) return 'Informe um telefone válido com DDD.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.data) || Number.isNaN(Date.parse(`${body.data}T00:00:00`))) return 'Informe uma data válida no formato AAAA-MM-DD.'
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(body.horario)) return 'Informe um horário válido no formato HH:MM.'
  if (body.horario < '12:00' || body.horario > '22:30' || Number(body.horario.slice(3)) % 30 !== 0) return 'Escolha um horário entre 12:00 e 22:30, em intervalos de 30 minutos.'
  if (!Number.isInteger(Number(body.pessoas)) || Number(body.pessoas) < 1 || Number(body.pessoas) > 30) return 'A quantidade de pessoas deve ser entre 1 e 30.'
  return null
}

app.get('/api', (req, res) => {
  res.json({
    nome: 'API do Restaurante',
    versao: '1.0.0',
    endpoints: ['/api/health', '/api/menu', '/api/reservas', '/api/pedidos', '/api/avaliacoes'],
  })
})

app.get('/api/health', asyncRoute(async (req, res) => {
  await readStore()
  res.json({ status: 'ok', servico: 'restaurante-api', horario: new Date().toISOString() })
}))

app.get('/api/menu', asyncRoute(async (req, res) => {
  const store = await readStore()
  let menu = store.menu
  if (req.query.categoria) menu = menu.filter((item) => item.categoria.toLowerCase() === String(req.query.categoria).toLowerCase())
  if (req.query.disponivel === 'true') menu = menu.filter((item) => item.disponivel)
  res.json(menu)
}))

app.get('/api/menu/:id', asyncRoute(async (req, res) => {
  const { menu } = await readStore()
  const item = menu.find((entry) => entry.id === req.params.id)
  if (!item) return res.status(404).json({ erro: 'Prato não encontrado.' })
  res.json(item)
}))

app.post('/api/menu', asyncRoute(async (req, res) => {
  const error = validateMenuItem(req.body)
  if (error) return badRequest(res, error)
  const item = await updateStore((store) => {
    const novoItem = {
      id: crypto.randomUUID(),
      nome: req.body.nome.trim(),
      descricao: req.body.descricao.trim(),
      categoria: req.body.categoria.trim(),
      preco: Number(req.body.preco),
      imagem: req.body.imagem || '',
      disponivel: req.body.disponivel ?? true,
    }
    store.menu.push(novoItem)
    return novoItem
  })
  res.status(201).json(item)
}))

app.route('/api/menu/:id')
  .put(asyncRoute(async (req, res) => {
    const error = validateMenuItem(req.body)
    if (error) return badRequest(res, error)
    const item = await updateStore((store) => {
      const existing = store.menu.find((entry) => entry.id === req.params.id)
      if (!existing) return null
      Object.assign(existing, {
        nome: req.body.nome.trim(),
        descricao: req.body.descricao.trim(),
        categoria: req.body.categoria.trim(),
        preco: Number(req.body.preco),
        imagem: req.body.imagem ?? existing.imagem,
        disponivel: req.body.disponivel ?? existing.disponivel,
      })
      return existing
    })
    if (!item) return res.status(404).json({ erro: 'Prato não encontrado.' })
    res.json(item)
  }))
  .patch(asyncRoute(async (req, res) => {
    const item = await updateStore((store) => {
      const existing = store.menu.find((entry) => entry.id === req.params.id)
      if (!existing) return null
      const updated = { ...existing, ...req.body }
      const error = validateMenuItem(updated)
      if (error) return { erro: error }
      Object.assign(existing, {
        nome: updated.nome.trim(),
        descricao: updated.descricao.trim(),
        categoria: updated.categoria.trim(),
        preco: Number(updated.preco),
        imagem: updated.imagem || '',
        disponivel: updated.disponivel !== false,
      })
      return existing
    })
    if (!item) return res.status(404).json({ erro: 'Prato não encontrado.' })
    if (item.erro) return badRequest(res, item.erro)
    res.json(item)
  }))
  .delete(asyncRoute(async (req, res) => {
    const removed = await updateStore((store) => {
      const index = store.menu.findIndex((entry) => entry.id === req.params.id)
      if (index < 0) return false
      store.menu.splice(index, 1)
      return true
    })
    if (!removed) return res.status(404).json({ erro: 'Prato não encontrado.' })
    res.status(204).end()
  }))

app.get('/api/reservas', asyncRoute(async (req, res) => {
  const { reservas } = await readStore()
  const filtered = reservas.filter((item) => (!req.query.status || item.status === req.query.status) && (!req.query.data || item.data === req.query.data))
  res.json(filtered)
}))

app.post('/api/reservas', asyncRoute(async (req, res) => {
  const error = validateReservation(req.body)
  if (error) return badRequest(res, error)
  const reserva = await updateStore((store) => {
    const novaReserva = {
      id: crypto.randomUUID(),
      nome: req.body.nome.trim(),
      email: req.body.email.trim().toLowerCase(),
      telefone: req.body.telefone?.trim() || '',
      data: req.body.data,
      horario: req.body.horario,
      pessoas: Number(req.body.pessoas),
      observacoes: req.body.observacoes?.trim() || '',
      status: 'pendente',
      criadoEm: new Date().toISOString(),
    }
    store.reservas.push(novaReserva)
    return novaReserva
  })
  const usuario = await updateUsers((users) => {
    const email = reserva.email.toLowerCase()
    let existing = users.find((user) => user.email?.toLowerCase() === email)
    if (!existing) {
      existing = {
        id: crypto.randomUUID(),
        nome: reserva.nome,
        email,
        criadoEm: reserva.criadoEm,
        reservas: [],
      }
      users.push(existing)
    }

    existing.nome = reserva.nome
    existing.email = email
    existing.telefone = reserva.telefone
    existing.quantidadePessoas = reserva.pessoas
    existing.observacoes = reserva.observacoes
    existing.dataReserva = reserva.data
    existing.horarioReserva = reserva.horario
    existing.atualizadoEm = reserva.criadoEm
    existing.reservas ??= []
    existing.reservas.push({
      reservaId: reserva.id,
      data: reserva.data,
      horario: reserva.horario,
      pessoas: reserva.pessoas,
      observacoes: reserva.observacoes,
      status: reserva.status,
      criadoEm: reserva.criadoEm,
    })
    return existing
  })
  res.status(201).json({ ...reserva, usuarioId: usuario.id })
}))

app.route('/api/reservas/:id')
  .get(asyncRoute(async (req, res) => {
    const { reservas } = await readStore()
    const reserva = reservas.find((item) => item.id === req.params.id)
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada.' })
    res.json(reserva)
  }))
  .patch(asyncRoute(async (req, res) => {
    const allowedStatuses = ['pendente', 'confirmada', 'cancelada', 'concluida']
    if (req.body.status && !allowedStatuses.includes(req.body.status)) return badRequest(res, 'Status de reserva inválido.')
    const reserva = await updateStore((store) => {
      const existing = store.reservas.find((item) => item.id === req.params.id)
      if (!existing) return null
      if (req.body.status) existing.status = req.body.status
      if (req.body.observacoes !== undefined) existing.observacoes = String(req.body.observacoes)
      return existing
    })
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada.' })
    res.json(reserva)
  }))
  .delete(asyncRoute(async (req, res) => {
    const removed = await updateStore((store) => {
      const index = store.reservas.findIndex((item) => item.id === req.params.id)
      if (index < 0) return false
      store.reservas.splice(index, 1)
      return true
    })
    if (!removed) return res.status(404).json({ erro: 'Reserva não encontrada.' })
    res.status(204).end()
  }))

app.get('/api/pedidos', asyncRoute(async (req, res) => {
  const { pedidos } = await readStore()
  res.json(pedidos.filter((item) => !req.query.status || item.status === req.query.status))
}))

app.post('/api/pedidos', asyncRoute(async (req, res) => {
  const { cliente, itens, tipo = 'retirada', endereco } = req.body
  if (!cliente?.nome?.trim() || !Array.isArray(itens) || itens.length === 0) return badRequest(res, 'Nome do cliente e ao menos um item são obrigatórios.')
  if (!['retirada', 'entrega', 'salao'].includes(tipo)) return badRequest(res, 'Tipo de pedido inválido.')
  if (tipo === 'entrega' && !endereco?.trim()) return badRequest(res, 'Informe o endereço para pedidos de entrega.')
  const pedido = await updateStore((store) => {
    const orderItems = []
    for (const item of itens) {
      const dish = store.menu.find((entry) => entry.id === (item.produtoId || item.menuItemId))
      const quantidade = Number(item.quantidade)
      if (!dish || !dish.disponivel || !Number.isInteger(quantidade) || quantidade < 1 || quantidade > 50) {
        return { erro: 'Confira os itens: prato indisponível ou quantidade inválida.' }
      }
      orderItems.push({ produtoId: dish.id, nome: dish.nome, quantidade, precoUnitario: dish.preco, subtotal: Number((dish.preco * quantidade).toFixed(2)) })
    }
    const novoPedido = {
      id: crypto.randomUUID(),
      cliente: { nome: cliente.nome.trim(), telefone: cliente.telefone?.trim() || '' },
      tipo,
      endereco: tipo === 'entrega' ? endereco.trim() : '',
      itens: orderItems,
      total: Number(orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)),
      status: 'recebido',
      pagamento: { metodo: req.body.metodoPagamento || 'nao_informado', status: 'pendente' },
      criadoEm: new Date().toISOString(),
    }
    store.pedidos.push(novoPedido)
    return novoPedido
  })
  if (pedido.erro) return res.status(409).json({ erro: pedido.erro })
  res.status(201).json(pedido)
}))

app.route('/api/pedidos/:id')
  .get(asyncRoute(async (req, res) => {
    const { pedidos } = await readStore()
    const pedido = pedidos.find((item) => item.id === req.params.id)
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' })
    res.json(pedido)
  }))
  .patch(asyncRoute(async (req, res) => {
    const allowedStatuses = ['recebido', 'em_preparo', 'pronto', 'saiu_para_entrega', 'concluido', 'cancelado']
    if (!allowedStatuses.includes(req.body.status)) return badRequest(res, 'Informe um status de pedido válido.')
    const pedido = await updateStore((store) => {
      const existing = store.pedidos.find((item) => item.id === req.params.id)
      if (!existing) return null
      existing.status = req.body.status
      return existing
    })
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' })
    res.json(pedido)
  }))
  .delete(asyncRoute(async (req, res) => {
    const removed = await updateStore((store) => {
      const index = store.pedidos.findIndex((item) => item.id === req.params.id)
      if (index < 0) return false
      store.pedidos.splice(index, 1)
      return true
    })
    if (!removed) return res.status(404).json({ erro: 'Pedido não encontrado.' })
    res.status(204).end()
  }))

app.get('/api/avaliacoes', asyncRoute(async (req, res) => {
  const { avaliacoes } = await readStore()
  res.json(avaliacoes)
}))

app.post('/api/avaliacoes', asyncRoute(async (req, res) => {
  const { nome, nota, comentario } = req.body
  const rating = Number(nota)
  if (!nome?.trim() || !comentario?.trim() || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return badRequest(res, 'Informe nome, comentário e uma nota inteira de 1 a 5.')
  }
  const avaliacao = await updateStore((store) => {
    const novaAvaliacao = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      nota: rating,
      comentario: comentario.trim(),
      criadoEm: new Date().toISOString(),
    }
    store.avaliacoes.push(novaAvaliacao)
    return novaAvaliacao
  })
  res.status(201).json(avaliacao)
}))

app.get('/users', asyncRoute(async (req, res) => res.json(await readUsers())))

app.get('/users/:id', asyncRoute(async (req, res) => {
  const users = await readUsers()
  const user = users.find((entry) => entry.id === req.params.id)
  if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' })
  res.json(user)
}))

app.post('/users', asyncRoute(async (req, res) => {
  const { nome, email } = req.body
  if (!nome?.trim() || !email?.trim() || !/^\S+@\S+\.\S+$/.test(email)) return badRequest(res, 'Nome e e-mail válido são obrigatórios.')
  const user = await updateUsers((users) => {
    const newUser = { id: crypto.randomUUID(), nome: nome.trim(), email: email.trim().toLowerCase(), criadoEm: new Date().toISOString() }
    users.push(newUser)
    return newUser
  })
  res.status(201).json(user)
}))

app.put('/users/:id', asyncRoute(async (req, res) => {
  const user = await updateUsers((users) => {
    const existing = users.find((entry) => entry.id === req.params.id)
    if (!existing) return null
    if (req.body.nome !== undefined) existing.nome = String(req.body.nome).trim()
    if (req.body.email !== undefined) existing.email = String(req.body.email).trim().toLowerCase()
    return existing
  })
  if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' })
  if (!user.nome || !/^\S+@\S+\.\S+$/.test(user.email)) return badRequest(res, 'Nome e e-mail válido são obrigatórios.')
  res.json(user)
}))

app.delete('/users/:id', asyncRoute(async (req, res) => {
  const removed = await updateUsers((users) => {
    const index = users.findIndex((entry) => entry.id === req.params.id)
    if (index < 0) return false
    users.splice(index, 1)
    return true
  })
  if (!removed) return res.status(404).json({ erro: 'Usuário não encontrado.' })
  res.status(204).end()
}))

app.use(express.static(SITE_DIR))

app.get(/.*/, asyncRoute(async (req, res) => {
  if (req.path.startsWith('/api') || req.path === '/users' || req.path.startsWith('/users/')) {
    return res.status(404).json({ erro: 'Rota não encontrada.' })
  }
  try {
    await fs.access(path.join(SITE_DIR, 'index.html'))
    res.sendFile(path.join(SITE_DIR, 'index.html'))
  } catch {
    res.status(404).json({ erro: 'Aplicação web ainda não compilada. Execute o build do frontend.' })
  }
}))

app.use((error, req, res, next) => {
  console.error(error)
  if (res.headersSent) return next(error)
  res.status(500).json({ erro: 'Erro interno do servidor.' })
})

await readStore()
app.listen(PORT, () => {
  console.log(`Servidor do restaurante rodando em http://localhost:${PORT}`)
  console.log(`Documentação básica da API: http://localhost:${PORT}/api`)
})