import express, { Request, Response, NextFunction } from 'express';
import { ProductsService } from '@org/api-products';
import { UsersService } from '@org/api-users';
import { createToken, verifyToken, TokenPayload } from '@org/api-auth';
import {
  ApiResponse,
  Product,
  ProductFilter,
  PaginatedResponse,
  User,
  LoginInput,
  LoginResponse,
} from '@org/models';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

const app = express();
const productsService = new ProductsService();
const usersService = new UsersService(
  process.env.USERS_DB_PATH ?? 'apps/api/data/users.db',
);

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Auth middleware
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
    return;
  }

  req.user = payload;
  next();
}

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = (req.body ?? {}) as LoginInput;
    if (!email || !password) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'email and password are required',
      };
      return res.status(400).json(response);
    }

    const user = usersService.verifyCredentials(email, password);
    if (!user) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Invalid email or password',
      };
      return res.status(401).json(response);
    }

    const token = createToken({ sub: user.id, email: user.email });
    const response: ApiResponse<LoginResponse> = {
      data: { token, user },
      success: true,
    };
    return res.json(response);
  } catch {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: 'An error occurred during login',
    };
    return res.status(500).json(response);
  }
});

// Products endpoints (public)
app.get('/api/products', (req, res) => {
  try {
    const filter: ProductFilter = {};

    if (req.query.category) filter.category = req.query.category as string;
    if (req.query.minPrice) filter.minPrice = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.maxPrice = Number(req.query.maxPrice);
    if (req.query.inStock !== undefined)
      filter.inStock = req.query.inStock === 'true';
    if (req.query.searchTerm)
      filter.searchTerm = req.query.searchTerm as string;

    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;

    const result = productsService.getProducts(filter, page, pageSize);
    const response: ApiResponse<PaginatedResponse<Product>> = {
      data: result,
      success: true,
    };
    res.json(response);
  } catch {
    res.status(500).json({ data: null, success: false, error: 'An error occurred while fetching products' });
  }
});

app.get('/api/products/categories', (req, res) => {
  try {
    const response: ApiResponse<string[]> = {
      data: productsService.getCategories(),
      success: true,
    };
    res.json(response);
  } catch {
    res.status(500).json({ data: null, success: false, error: 'An error occurred while fetching categories' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = productsService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ data: null, success: false, error: 'Product not found' });
    }
    return res.json({ data: product, success: true });
  } catch {
    return res.status(500).json({ data: null, success: false, error: 'An error occurred while fetching the product' });
  }
});

// Users endpoints (protected)
app.get('/api/users', requireAuth, (req, res) => {
  try {
    const response: ApiResponse<User[]> = {
      data: usersService.getUsers(),
      success: true,
    };
    res.json(response);
  } catch {
    res.status(500).json({ data: null, success: false, error: 'An error occurred while fetching users' });
  }
});

app.post('/api/users', requireAuth, (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) {
      return res.status(400).json({ data: null, success: false, error: 'name, email and password are required' });
    }

    const user = usersService.createUser({ name, email, password });
    return res.status(201).json({ data: user, success: true } as ApiResponse<User>);
  } catch {
    return res.status(500).json({ data: null, success: false, error: 'An error occurred while creating the user' });
  }
});

app.delete('/api/users/:id', requireAuth, (req, res) => {
  try {
    const deleted = usersService.deleteUser(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ data: null, success: false, error: 'User not found' });
    }
    return res.status(204).send();
  } catch {
    return res.status(500).json({ data: null, success: false, error: 'An error occurred while deleting the user' });
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
