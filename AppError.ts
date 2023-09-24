class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: any[];

    constructor(message: string="error", statusCode: number, errors?: any[]) {
        super(message);
        this.statusCode = statusCode || 500;
        this.isOperational = true;

        if (errors) {
            this.errors = errors;
        }

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
