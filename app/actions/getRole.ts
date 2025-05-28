"use server"
import { prisma } from "@/lib/prisma"

export async function getRole(userId: string) {
    try {
        const userRole = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!userRole) {
            return {
                error: new Error("User not found"),
                success: false,
                message: "User role not found",
            };
        }

        return {
            role: userRole.role,
            success: true,
            message: "User role fetched successfully",
        };
    } catch (error) {
        console.error("Error fetching user role:", error);
        return {
            error: new Error("Internal Server Error"),
            success: false,
            message: "Failed to fetch user role",
        };
    }
}