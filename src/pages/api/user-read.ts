import type { APIRoute } from "astro";
import { MongoClient } from "mongodb";
import { validateEvent, verifySignature } from "nostr-tools";

import config from "../../../site.config";

// Connection URL
const dbUrl = import.meta.env.MONGODB_URI;
const client = new MongoClient(dbUrl);
const { dbName, dbCollection } = config;

export const post: APIRoute = async function post({ request }) {
  if (request.headers.get("Content-Type") === "application/json") {
    const body = await request.json();
    const { signedEvent } = body;

    const eventOk = validateEvent(signedEvent);
    const signatureOk = verifySignature(signedEvent);

    if (!(eventOk && signatureOk)) {
      return new Response(null, { status: 400 });
    } else {
      const { pubkey } = signedEvent;

      // Use connect method to connect to the server
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(dbCollection);

      const user = await collection.findOne({ pubkey });
      client.close();

      if (user) {
        return new Response(
          JSON.stringify({
            success: true,
            data: user,
          }),
          {
            status: 200,
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Nggak nemu pengguna",
          }),
          {
            status: 200,
          }
        );
      }
    }
  }

  return new Response(null, { status: 400 });
};
