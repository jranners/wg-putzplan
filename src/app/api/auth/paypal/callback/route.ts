
import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        const clientId = process.env.PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

        // 1. Get Access Token
        const tokenResponse = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error("PayPal Token Error:", tokenData);
            return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
        }

        const accessToken = tokenData.access_token;

        // 2. Get User Info
        const userResponse = await fetch("https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=openid", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
            console.error("PayPal User Info Error:", userData);
            return NextResponse.json({ error: "Failed to get user info" }, { status: 500 });
        }

        // 3. Extract Info
        const email = userData.email;
        const name = userData.name || `${userData.given_name} ${userData.family_name}`;
        const paypalId = userData.payer_id;

        // Derive paypal.me handle from email (naive approach, user can edit later if needed)
        const paypalMeHandle = email.split("@")[0];

        // 4. Find or Create User
        let userResult = await db.query.users.findFirst({
            where: eq(users.paypalEmail, email)
        });

        const userId = userResult ? userResult.id : uuidv4();

        if (!userResult) {
            await db.insert(users).values({
                id: userId,
                name,
                paypalEmail: email,
                paypalName: name,
                paypalMeHandle,
                role: "member"
            });
        } else {
            await db.update(users)
                .set({
                    paypalName: name,
                    paypalMeHandle: userResult.paypalMeHandle || paypalMeHandle
                })
                .where(eq(users.id, userId));
        }

        // 5. Set Session
        // TODO: Migrating to NextAuth.js. This manual session setting is deprecated.
        // Consider using NextAuth's PayPal provider or a custom credential flow.
        // await setCurrentUser(user.id);
        console.warn("Manual session setting via setCurrentUser is deprecated. User upserted but not logged in via this route:", userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PayPal Callback Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
