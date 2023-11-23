import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Book Buddy',
            version: '1.0.0',
            description: 'API documentation for Book Buddy API',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
            {
                url: 'https://book-buddy-server-6b413ec41906.herokuapp.com',
                description: 'Heroku server',
            },
        ],
        components: {
            schemas: {
                Book: {
                    type: 'object',
                    properties: {
                        bookApiId: {
                            type: 'string',
                            description: 'The unique identifier for the book.',
                        },
                        owner: {
                            type: 'string',
                            description: 'The owner of the book.',
                        },
                        title: {
                            type: 'string',
                            description: 'The title of the book.',
                        },
                        authors: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'The authors of the book.',
                        },
                        description: {
                            type: 'string',
                            description: 'The description of the book.',
                        },
                        publisher: {
                            type: 'string',
                            description: 'The publisher of the book.',
                        },
                        thumbnail: {
                            type: 'string',
                            description: 'The URL of the book\'s thumbnail.',
                        },
                        category: {
                            type: 'string',
                            description: 'The category of the book.',
                            default: 'Not specified',
                        },
                        pageCount: {
                            type: 'string',
                            description: 'The number of pages in the book.',
                        },
                        progress: {
                            type: 'number',
                            description: 'The reading progress of the book.',
                        },
                        shelf: {
                            type: 'number',
                            description: 'The shelf where the book is placed.',
                            enum: [0, 1, 2],
                            default: 0,
                        },
                    },
                    required: ['bookApiId', 'owner', 'title', 'authors', 'description', 'pageCount', 'shelf'],
                },
                User: {
                    type: 'object',
                    properties: {
                        email: {
                            type: 'string',
                            description: 'The email address of the user.',
                        },
                        password: {
                            type: 'string',
                            description: 'The password of the user.',
                        },
                        isAdmin: {
                            type: 'boolean',
                            description: 'Indicates if the user is an admin.',
                        },
                    },
                    required: ['email', 'password', 'isAdmin'],
                },
            },
        },
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
