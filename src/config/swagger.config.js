const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RestoBar - La Vieja Estación API',
      version: '1.0.0',
      description: 'API REST para gestión de restobar con sistema de pedidos, mesas, productos y ventas',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@restobar.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor de Desarrollo'
      },
      {
        url: 'http://localhost:4001',
        description: 'Servidor de Testing'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
          description: 'Token JWT almacenado en cookie'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT en header Authorization'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            apellido: {
              type: 'string',
              description: 'Apellido del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            dni: {
              type: 'string',
              description: 'DNI del usuario'
            },
            rol: {
              type: 'string',
              enum: ['admin', 'cajero', 'mesero', 'cliente'],
              description: 'Rol del usuario en el sistema'
            },
            estado: {
              type: 'boolean',
              description: 'Estado activo/inactivo del usuario'
            }
          }
        },
        Producto: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del producto'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del producto'
            },
            precio: {
              type: 'number',
              description: 'Precio del producto'
            },
            categoria: {
              type: 'string',
              enum: ['Comida', 'Bebida', 'Postre', 'Entrada'],
              description: 'Categoría del producto'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del producto'
            },
            disponible: {
              type: 'boolean',
              description: 'Disponibilidad del producto'
            },
            imagen: {
              type: 'string',
              description: 'URL de la imagen del producto'
            }
          }
        },
        Pedido: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del pedido'
            },
            mesa: {
              type: 'number',
              description: 'Número de mesa'
            },
            productos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  producto: {
                    type: 'string',
                    description: 'ID del producto'
                  },
                  cantidad: {
                    type: 'number',
                    description: 'Cantidad del producto'
                  },
                  precio: {
                    type: 'number',
                    description: 'Precio unitario'
                  }
                }
              }
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'en_preparacion', 'completado', 'cancelado'],
              description: 'Estado del pedido'
            },
            total: {
              type: 'number',
              description: 'Total del pedido'
            },
            mesero: {
              type: 'string',
              description: 'ID del mesero que tomó el pedido'
            }
          }
        },
        Mesa: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            numero: {
              type: 'number',
              description: 'Número de la mesa'
            },
            capacidad: {
              type: 'number',
              description: 'Capacidad de personas'
            },
            estado: {
              type: 'string',
              enum: ['disponible', 'ocupada', 'reservada'],
              description: 'Estado de la mesa'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            ok: {
              type: 'boolean',
              example: false
            },
            mensaje: {
              type: 'string',
              description: 'Mensaje de error'
            },
            errores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: {
                    type: 'string'
                  },
                  param: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            ok: {
              type: 'boolean',
              example: true
            },
            mensaje: {
              type: 'string',
              description: 'Mensaje de éxito'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'No autenticado - Token no válido o ausente',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                ok: false,
                mensaje: 'No se proporcionó token de autenticación',
                codigo: 'NO_AUTENTICADO'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acceso denegado - Permisos insuficientes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                ok: false,
                mensaje: 'Acceso denegado. Se requiere rol de admin',
                codigo: 'ROL_INSUFICIENTE'
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                ok: false,
                mensaje: 'Errores de validación',
                errores: [
                  {
                    msg: 'El email es requerido',
                    param: 'email'
                  }
                ]
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                ok: false,
                mensaje: 'Recurso no encontrado'
              }
            }
          }
        },
        ServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                ok: false,
                mensaje: 'Error interno del servidor'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints de autenticación y gestión de sesiones'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios del sistema'
      },
      {
        name: 'Productos',
        description: 'Gestión de productos del menú'
      },
      {
        name: 'Pedidos',
        description: 'Gestión de pedidos'
      },
      {
        name: 'Mesas',
        description: 'Gestión de mesas del restobar'
      },
      {
        name: 'Ventas',
        description: 'Gestión de ventas y facturación'
      },
      {
        name: 'Reportes',
        description: 'Reportes y estadísticas'
      },
      {
        name: 'Cierre de Caja',
        description: 'Gestión de cierre de caja'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
