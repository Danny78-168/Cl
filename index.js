// 在最外層宣告全域 Set，阻擋同節點短時間內的重複並發
const repliedUsersSet = new Set();

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

        const managedUserIds = ACCOUNTS.map(a => a.user_id);
        const ZHU_ZHU = ACCOUNTS.find(acc => acc.user_id === "28200981592893102");

        const entries = body.entry || [{ id: body.entry_id, changes: body.values }];

        for (const entry of entries) {
          const changes = entry.changes || [];

          for (const change of changes) {
            const itemValue = change.value || {};
            const field = change.field;

            if (field === "replies" || itemValue.id) {
              const commentId = itemValue.id;
              // 取得留言者 ID (不同 webhook 格式可能在 from.id 或 user_id)
              const commenterId = itemValue.from?.id || itemValue.user_id;
              const text = itemValue.text || "";

              // 🛑 防線 1：受控帳號發的內容一律不回覆
              if (commenterId && managedUserIds.includes(commenterId)) {
                console.log(`[過濾內部帳號] 留言者 ${commenterId} 為受控帳號，略過`);
                continue;
              }

              // 🛑 防線 2：如果留言內容本身就包含官方 LINE 關鍵字，代表是自己的回覆訊息被推播回來，絕對不回
              if (text.includes("@osc168") || text.includes("感謝留言！")) {
                console.log(`[死循環防護] 攔截到包含官方回覆詞的內容，略過`);
                continue;
              }

              // 🛑 防線 3：記憶體去重（針對陌生用戶 ID）
              if (commenterId && repliedUsersSet.has(commenterId)) {
                console.log(`[記憶體去重] 用戶 ${commenterId} 已經被標記回覆過，略過`);
                continue;
              }

              // 🛑 防線 4：快取層鎖定陌生用戶 ID（防止換節點時重複觸發，鎖定 24 小時）
              const cache = caches.default;
              const userLockKey = new Request(`https://lock.internal/user/${commenterId}`);
              const alreadyRepliedUser = await cache.match(userLockKey);

              if (alreadyRepliedUser) {
                console.log(`[全域快取攔截] 陌生用戶 ${commenterId} 先前已接收過回覆，略過`);
                continue;
              }

              // 標記該陌生用戶（記憶體 + Cache 雙重鎖定）
              if (commenterId) {
                repliedUsersSet.add(commenterId);
                const lockResponse = new Response("locked", {
                  headers: { "Cache-Control": "max-age=86400" } // 鎖定 24 小時 (86400 秒)
                });
                ctx.waitUntil(cache.put(userLockKey, lockResponse));
              }

              // 🎯 執行回覆
              console.log(`[觸發回覆] 陌生用戶 ${commenterId} 首度留言，由 zhu zhu 回覆一次`);
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
