import prisma from "@/lib/prisma";
import { syncCurrentUser } from "@/lib/sync-user";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const dbUser = await syncCurrentUser();
        if (!dbUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const body = await request.json();
        const { title, description, category } = body;

        const post = await prisma.post.create({
            data: {
                title,
                description,
                category,
                authorId: dbUser.id,
            }
        })
        return NextResponse.json(post);

    } catch (err) {
        console.error("Error creating post: ", err);
        return NextResponse.json(
            {
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const get = await prisma.post.findMany({
            include: {
                author: true,
                votes: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        if (get) {
            return NextResponse.json(get)
        }

    } catch (err) {
        return NextResponse.json(
            {
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}