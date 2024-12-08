import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const verifyDatabaseConnection = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
}