import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

// Validate environment variables
if (!apiKey || !apiSecret) {
  throw new Error(
    "STREAM_API_KEY or STREAM_API_SECRET is missing. Please configure them in your environment variables."
  );
}

console.log("✓ Stream API Key found");
console.log("✓ Stream API Secret found");

// Chat client (Messaging)
export const chatClient = StreamChat.getInstance(
  apiKey,
  apiSecret
);

// Video client (Calls)
export const streamClient = new StreamClient(
  apiKey,
  apiSecret
);

// export const upsertStreamUser = async (userData) => {
//   try {
//     const x=await chatClient.upsertUser(userData);
//     console.log(x);
//     console.log("Stream user upserted successfully:", userData.id);
//   } catch (error) {
//     console.error("Error upserting Stream user:", error);
//     throw error;
//   }
// };

export const upsertStreamUser = async (userData) => {
  try {
    console.log("Creating Stream user:", userData);

    const result = await chatClient.upsertUser(userData);

    console.log("Upsert result:", JSON.stringify(result));

    const users = await chatClient.queryUsers({
      id: { $eq: userData.id },
    });

    console.log("Query result:", JSON.stringify(users));

    return result;
  } catch (error) {
    console.error("Stream Error:", error);
    throw error;
  }
};


export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting Stream user:", error);
    throw error;
  }
};