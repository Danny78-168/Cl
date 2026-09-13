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
      }
      return new Response("驗證失敗", { status: 403 });
    }

    if (request.method === "POST") {
      try {
        const body = await request.json();
        console.log("收到 Webhook Body:", JSON.stringify(body));

        // 受控帳號資料池
        const ACCOUNTS = [
          { "name": "吳芷晴", "user_id": "28596680836634588" },
          { "name": "zhu zhu", "user_id": "28200981592893102", "token": "THAAUHgwPgYZC5BYmEwUTkwVlFJZAXNQZATVhRk9KbU9GMU9Xd2lvb0pOYjJpNW1VMVhOWG1qQ09aODlwc1pFSW9wVzFraFdyMDBiRV83WHpXSEItQlJReGRQeldNYnBydG94ckE3OUxUUXFGMXBHa19DUHdSenZA2U1VodkdSMF81R0ZAhUQZDZD" },
          { "name": "范若涵", "user_id": "28076669438700788" },
          { "name": "許家瑜", "user_id": "38313052558309790" },
          { "name": "劉語晴", "user_id": "38625351180412287" },
          { "name": "趙婉妍", "user_id": "38263237809990912" },
          { "name": "邵佳妍", "user_id": "28594599583509195" },
          { "name": "林語晴", "user_id": "28521575497477119" },
          { "name": "蔡語妍", "user_id": "39277925828461039" },
          { "name": "林佳蓉", "user_id": "38420202317627307" },
          { "name": "雲棲澗", "user_id": "28020868204281450" },
          { "name": "晚松辭", "user_id": "27931383629866349" },
          { "name": "Casey", "user_id": "28620832987606379" },
          { "name": "風渡澗", "user_id": "29645890931666351" },
          { "name": "春歸霧", "user_id": "28719651657626311" },
          { "name": "落星舟", "user_id": "28377246128570724" },
          { "name": "楊可晴", "user_id": "38372830355665885" },
          { "name": "Domi", "user_id": "28438680382428847" },
          { "name": "Alexa Fitzgerald", "user_id": "28547776571521138" },
          { "name": "Faye Cline", "user_id": "28153286724339870" },
          { "name": "Cullen Reyes", "user_id": "27669839782693594" }
        ];

        // 收集所有受控帳號的 user_id
        const managedUserIds = ACCOUNTS.map(a => a.user_id);
        
        // 專用回覆帳號：zhu zhu
        const ZHU_ZHU = ACCOUNTS.find(acc => acc.user_id === "28200981592893102");

        const entries = body.entry || [{ id: body.entry_id, changes: body.values }];

        for (const entry of entries) {
          const changes = entry.changes || [];

          for (const change of changes) {
            const itemValue = change.value || {};
            const field = change.field;

            if (field === "replies" || itemValue.id) {
              const commentId = itemValue.id;
              const commenterId = itemValue.from?.id || itemValue.user_id;

              // 🛑 防線 1：如果留言者是我們自己的任一受控帳號（含 zhu zhu 本身），直接跳過
              if (commenterId && managedUserIds.includes(commenterId)) {
                console.log(`[過濾內部帳號] 留言者 ${commenterId} 為受控帳號，不執行自動回覆`);
                continue;
              }

              // 🛑 防線 2：Cloudflare 全域快取去重（確保此留言 ID 只會被回覆 1 次）
              const cache = caches.default;
              const cacheKey = new Request(`https://lock.internal/comment/${commentId}`);
              const alreadyProcessed = await cache.match(cacheKey);

              if (alreadyProcessed) {
                console.log(`[去重攔截] 留言 ID: ${commentId} 先前已回覆過，略過`);
                continue;
              }

              // 寫入快取鎖（鎖定 1 小時，防止 Meta 重複推播相同 Webhook Event）
              const lockResponse = new Response("locked", {
                headers: { "Cache-Control": "max-age=3600" }
              });
              ctx.waitUntil(cache.put(cacheKey, lockResponse));

              // 🎯 執行回覆：固定只用「zhu zhu」的身份回應陌生用戶
              console.log(`[觸發自動回覆] 偵測到陌生用戶 ${commenterId} 留言，由 [zhu zhu] 執行唯一一次回覆`);
              ctx.waitUntil(autoReply(commentId, ZHU_ZHU.user_id, ZHU_ZHU.token));
            }
          }
        }

        return new Response("EVENT_RECEIVED", { status: 200 });
      } catch (error) {
        console.log("Webhook 處理異常:", error);
        return new Response("Error", { status: 500 });
      }
    }

    return new Response("🤖 Threads Webhook OK!", { status: 200 });
  }
};

async function autoReply(commentId, userId, token) {
  const replyMessage = "感謝留言！🔥 請直接加官方LINE洽詢👉 @osc168";
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
    console.log("建立回覆容器結果:", JSON.stringify(createJson));

    if (createJson.id) {
      const publishUrl = `https://graph.threads.net/v1.0/${userId}/threads_publish`;
      const publishData = new URLSearchParams({
        creation_id: createJson.id,
        access_token: token
      });
      const pubRes = await fetch(publishUrl, { method: "POST", body: publishData });
      const pubJson = await pubRes.json();
      console.log("發布回覆結果:", JSON.stringify(pubJson));
    }
  } catch (e) {
    console.log("自動回覆失敗:", e);
  }
}
