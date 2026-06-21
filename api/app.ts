import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import dashboardRoutes from './routes/dashboard.js'
import productsRoutes from './routes/products.js'
import ordersRoutes from './routes/orders.js'
import sortingRoutes from './routes/sorting.js'
import verificationRoutes from './routes/verification.js'
import aftersaleRoutes from './routes/aftersale.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/dashboard', dashboardRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/sorting', sortingRoutes)
app.use('/api/verification', verificationRoutes)
app.use('/api/aftersale', aftersaleRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  res.status(500).json({
    code: 500,
    message: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    message: 'API not found',
  })
})

export default app
