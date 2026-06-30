import express from 'express';
import { ProductsService } from '@org/api-products';
import { UsersService } from '@org/api-users';
import {
  ApiResponse,
  Product,
  ProductFilter,
  PaginatedResponse,
  User,
} from '@org/models';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

const app = express();
const productsService = new ProductsService();
const usersService = new UsersService(process.env.USERS_DB_PATH ?? 'apps/api/data/users.db');

// Middleware
app.use(express.json());

// CORS configuration for React app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

// Products endpoints
app.get('/api/products', (req, res) => {
  try {
    const filter: ProductFilter = {};

    if (req.query.category) {
      filter.category = req.query.category as string;
    }
    if (req.query.minPrice) {
      filter.minPrice = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filter.maxPrice = Number(req.query.maxPrice);
    }
    if (req.query.inStock !== undefined) {
      filter.inStock = req.query.inStock === 'true';
    }
    if (req.query.searchTerm) {
      filter.searchTerm = req.query.searchTerm as string;
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;

    const result = productsService.getProducts(filter, page, pageSize);

    const response: ApiResponse<PaginatedResponse<Product>> = {
      data: result,
      success: true,
    };

    res.json(response);
  } catch {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: 'An error occurred while fetching products',
    };
    res.status(500).json(response);
  }
});

app.get('/api/products/categories', (req, res) => {
  try {
    const categories = productsService.getCategories();
    const response: ApiResponse<string[]> = {
      data: categories,
      success: true,
    };
    res.json(response);
  } catch {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: 'An error occurred while fetching categories',
    };
    res.status(500).json(response);
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = productsService.getProductById(req.params.id);

    if (!product) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Product not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Product> = {
      data: product,
      success: true,
    };
    return res.json(response);
  } catch {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: 'An error occurred while fetching the product',
    };
    return res.status(500).json(response);
  }
});

// Users endpoints
app.get('/api/users', (req, res) => {
  try {
    const response: ApiResponse<User[]> = {
      data: usersService.getUsers(),
      success: true,
    };
    res.json(response);
  } catch {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: 'An error occurred while fetching users',
    };
    res.status(500).json(response);
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { name, email } = req.body ?? {};
    if (!name || !email) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'name and email are required',
      };
      return res.status(400).json(response);
    }

    const user = usersService.createUser({ name, email });
    const response: ApiResponse<User> = {
      data: user,
      success: true,
    };
    return res.status(201).json(response);
  } catch {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: 'An error occurred while creating the user',
    };
    return res.status(500).json(response);
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const deleted = usersService.deleteUser(Number(req.params.id));

    if (!deleted) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    return res.status(204).send();
  } catch {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: 'An error occurred while deleting the user',
    };
    return res.status(500).json(response);
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
