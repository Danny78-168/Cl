export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      const VERIFY_TOKEN = "osc168_webhook";

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      } else {
        return new Response("驗證失敗", { status: 403 });
      }
    }

    if (request.method === "POST") {
      try {
        const body = await request.json();
        if (body.object === "threads" || body.object === "instagram") {
          for (const entry of body.entry) {
            for (const change of entry.changes) {
              if (change.field === "replies") {
                const commentId = change.value.id;
                const fromUserId = change.value.from.id;
                
                // ⚠️ 在這裡填入你的資料
                const MY_USER_ID = "27669839782693594";
                const ACCESS_TOKEN = "THAAUHgwPgYZC5BYmE0czhVbm1qaTJYb0ptak9rS0V1ajQyYlFXakdRRl9rZAEY4emtrWmhGc2VtUmNpMzBjWWh4RnhTY2ZAZAelYycG02bzFRbzFHd3M5eUVNaTB4NElrazNLYzJfUDNsNWZAkZAUNxcmFXVG91S3VzX0tjUWpsRGZA3NlI3ZAwZDZD";

                if (fromUserId === MY_USER_ID) continue;

                await autoReply(commentId, MY_USER_ID, ACCESS_TOKEN);
              }
            }
          }
        }
        return new Response("EVENT_RECEIVED", { status: 200 });
      } catch (error) {
        return new Response("Error", { status: 500 });
      }
    }
    return new Response("🤖 OSC168 Threads Webhook OK!", { status: 200 });
  }
};

async function autoReply(commentId, userId, token) {
  const replyMessage = "感謝留言！🔥 通道細節已準備好，請直接加賴洽詢👉 @osc168";
  const createUrl = `https://graph.threads.net/v1.0/${userId}/threads`;
  const createData = new URLSearchParams({
    media_type: "TEXT",
    text: replyMessage,
    reply_to_id: commentId,
    access_token: token
  });

  try {
    const createRes = await fetch(createUrl, { method: "POST", body: createData });
    const createJson = await createRes.json();
    
    if (createJson.id) {
      const publishUrl = `https://graph.threads.net/v1.0/${userId}/threads_publish`;
      const publishData = new URLSearchParams({
        creation_id: createJson.id,
        access_token: token
      });
      await fetch(publishUrl, { method: "POST", body: publishData });
    }
  } catch (e) {
    console.log("回覆失敗", e);
  }
}
