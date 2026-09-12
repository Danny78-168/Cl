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

        // ⚠️ 請填寫完整的受控帳號清單與對應的 username（全小寫）
        const ACCOUNTS = [
          {
      "name": "吳芷晴",
      "user_id": "28596680836634588",
      "token": "THAAUHgwPgYZC5BYlp1ZAnRHclg0UEpVczZALODBvdnZAPUVRNVF9tbHctTWpPNk1hUlpacV9ZALXlhbEliekl1b0VhMHBmaUk4TzI0NEtPMWwzTGJmcnBzSjlBS09ZAOGJmVzUzMHhtVTkxT2FIdVNZANWlJWW50R0JEVFFiaFJRV1FKR3NYZAwZDZD"
    },
    {
      "name": "zhu zhu",
      "user_id": "28200981592893102",
      "token": "THAAUHgwPgYZC5BYmEwUTkwVlFJZAXNQZATVhRk9KbU9GMU9Xd2lvb0pOYjJpNW1VMVhOWG1qQ09aODlwc1pFSW9wVzFraFdyMDBiRV83WHpXSEItQlJReGRQeldNYnBydG94ckE3OUxUUXFGMXBHa19DUHdSenZA2U1VodkdSMF81R0ZAhUQZDZD"
    },
    {
      "name": "范若涵",
      "user_id": "28076669438700788",
      "token": "THAAUHgwPgYZC5BYmI1Yy1mWktzRUJDbVBKNnVZATjRCczVaUDdSQk5oY0JCSGtzUnd1aWFVZAF9hSEEyT21IRTNad0J0djZASOG1BbWNfVzBUNE83QlFjcmVIUGRNY21mcmlDZA19mVThuZA183U0c1NnZAuQTgzMXV6eWlKUHdKdXhjU2QwdwZDZD"
    },
    {
      "name": "許家瑜",
      "user_id": "38313052558309790",
      "token": "THAAUHgwPgYZC5BYmFfT1I5SW9PUlV3UnJqSGJlX0o1ZAWlNLWl4Q0lYdVB4X0RqMXNTM2s4aXlHM3RZAYzY5NGVvb0IzUWJOdUptblA4Sjl1dERDQmdfZA0d2bHNfWXJqTXJJWHBKUTU4VU9PdTNxdzRxZAC1fTVYtOXRmVEZAiLTdBaEE4UQZDZD"
    },
    {
      "name": "劉語晴",
      "user_id": "38625351180412287",
      "token": "THAAUHgwPgYZC5BYlp4S2Q1MVV3a0ZAuYlZABRHJPM0NtTEVpZA3BUV1hwSloxbWU4bXFPd1ZAnRmVYcnBsVHNiNm91MndScV9SVjd3cFNKV2FKVzRuYUJrNlBZASzVGUEVDd1kwRm9QeDFRZAGt0bkcycGdmQV9VaTR5RjY0eEhmQXYtTDQ4UQZDZD"
    },
    {
      "name": "趙婉妍",
      "user_id": "38263237809990912",
      "token": "THAAUHgwPgYZC5BYmJQX192cnBuSEZALN0RJbUx0LVZANZAzlwZAFhTWTVmM1JHN3V1REJsaGViYVhXUWxUV0xzOEJtSk1OdERac3JPa3VvTHRlakQ1eF8tY0VJX0NpRjNMRElkUHpLa2l0X2FuWHFaX0tBLWpJUjdCT3NXemFTWVk5VHN4UQZDZD"
    },
    {
      "name": "邵佳妍",
      "user_id": "28594599583509195",
      "token": "THAAUHgwPgYZC5BYlp2WV82NW1iLVdKTkVtRHNSbXRjOC12S1hOdG5ZAanNpVHJQRDE2Q2xhQUlWV3h5ZAHdQMm1mY2Y2cktmMG4wbTRMMXNvSnRSWXZADczdBekVibEtxcGhxRXctcUVpdWw3bGkyaUZAkOHdqdE8tVGNmSTltQ3ZAPUVhSUQZDZD"
    },
    {
      "name": "林語晴",
      "user_id": "28521575497477119",
      "token": "THAAUHgwPgYZC5BYmJMelJKa1dEdzIzeVBaWkdlMk5kQ3hlbUlVTkpvMzY3eEk1WE5vM1F5VEMwTlQwNW55NUY5M1djMU0teVpRV1hDZAmxaNWRUWHZA5Mjc0YzZA1ZA2E2ZAWR4c2FRa2FvYWhGRlZADa3F1LTgyNFhxWTR6YW5uSHFjT3RfQQZDZD"
    },
    {
      "name": "蔡語妍",
      "user_id": "39277925828461039",
      "token": "THAAUHgwPgYZC5BYlpIOWxGT25HZATN5dXBGYXJIWlZAuY0d6R2JJSFV6dEVFeFBfMWxMVzBqaHpkVWEzemQtQjNRNGl2c2xEWHQtU2dUZAWY5TW9hUG9GNEtveXV5UXJoODdwSVVHcENhZAzllZAlJrSmkxYTBiaUh4VmlhX3JqcTY2VDJJQQZDZD"
    },
    {
      "name": "林佳蓉",
      "user_id": "38420202317627307",
      "token": "THAAUHgwPgYZC5BYmJfNDk0cWhkMmZAVMWF0V0pPOE9IRjFfTktIaEpFbWRReWUzSkRPdTdic3JXa3ZAqSEFocXBYRW9EMDRoZATRXa2FIeUJoVjBUZAlhQY0kxUjdmMDBuSlM0VXZAGYWZAXQmtCbkxidldqOFBqbC1mRE43RWZA0akNsN0IzUQZDZD"
    },
    {
      "name": "雲棲澗",
      "user_id": "28020868204281450",
      "token": "THAAUHgwPgYZC5BYllodnl5b1ZAOQXIzSzF1OWxXUmRORms2NUZAGaWZAIb3JEaVFtLVAzcHItZA3djUVZANSUYwT25KSC1kamNDXy0wemJVOFZABRkN0MjYzYTNoUXExcUZAzSS1fS3U0c1I2QldraURIdnkzdUl6bUlZANFN2RUEtQ05QaXlXQQZDZD"
    },
    {
      "name": "晚松辭",
      "user_id": "27931383629866349",
      "token": "THAAUHgwPgYZC5BYmJSMGx6dC1QQUllZAnRQMC1UeFBnT185OVpkeHlOczdKWWVSMTl5YV8tMVZAmNGtYVUhQaUpsdmFKc0lRcm9BRmZAzWjczS01yZAzYteXV3QnZAWaERhRE84bGxGZAEJLaXBCRldGTVhpTGsyNkZARQm80c195SnNPemU1ZAwZDZD"
    },
    {
      "name": "Casey",
      "user_id": "28620832987606379",
      "token": "THAAUHgwPgYZC5BYmJieVljQmhQc3dUM3JIT2xLMVRSOVVpMjJ6SVRRb0NuYWo0OF95dTE1eHN3RjFEWmYxX1RBSkNVeHVxcGRtNDFOUDFac0syRV9CZAWMwNTExYWROcnBvR1ZAFOUdnOWp0ZAzJNQlFjVC1kX05PWE5QeURtZAS1PTm1xQQZDZD"
    },
    {
      "name": "風渡澗",
      "user_id": "29645890931666351",
      "token": "THAAUHgwPgYZC5BYlo4SHRsVjJmOGpRalFrMmhjQkh2NVEzQnZA2MUtUR1pWaDFpOGZAjUmplbmpfamFMR0NadENKMlo2TDNvQ1d3dHpQZAE1CRUs3XzNRTjFTZAG5NdXZAib2tWOFlUc1A2cTBYX2J3dzZAPUHVWVmUtUlBwam5pMEhSLW1PdwZDZD"
    },
    {
      "name": "春歸霧",
      "user_id": "28719651657626311",
      "token": "THAAUHgwPgYZC5BYllIWXRNNW5aMnRWQWZA6VDQtdGFLSU5HNG00dXBTd0ZA4RXFKMVlSSUhyYzVyOGlhV2NJQ3M5MHVqTXdoTE1nZAVVPV2I0aUhGX3k5LURfYnRyRl9qeExjYndfWFY5RDVDTnBTM01FdTdqNG5yRkJSNWg2ejk0YU5SdwZDZD"
    },
    {
      "name": "落星舟",
      "user_id": "28377246128570724",
      "token": "THAAUHgwPgYZC5BYmJXRVFEVHRoQ2UxSkNySHJBb2E1Mmo3U3Bucnk2MmdMUUp1WmxlWHBUVURMNnA1Y3NfQWk3X2FQSVEydFhBYVplb3lQTGd3Skkxc0ZAyR0lYV09sV29fZAV90T3dWbS1uNGcxXzNQTFBMTzdCb2l3djVZAdGZA6aC16dwZDZD"
    },
    {
      "name": "楊可晴",
      "user_id": "38372830355665885",
      "token": "THAAUHgwPgYZC5BYlptZAjlocU5uSE1Pd3VvdllGZAi1fZAXlSbkV1NVFwakNzOXlacHRCeWoyTFhrTkhFbjVrNVRDb2ZADVE91bHV5eU1DOUdmcGxKRVhmNnF0WmgtMDFtM0hFeFpJRDlLc01TSll4OFhYX3RUak41Q3lVT2N2NFJWTFNGUQZDZD"
    },
     {
      "name": "Domi",
      "user_id": "28438680382428847",
      "token": "THAAUHgwPgYZC5BYlpaclFMT2I5ejJWblp1TzgzcE14ZAzIwc2twY3VDajJxSk9zcEJpQ0ExOFprMHNOb0JNVFY1YzdFQzVhNVNOcEE2bC1hWEpxbUVFYTFwZATlyR18tV3ViU0syNnlrRndwczlzSEtEM2Y2VHMxUDFHWFZAZAS1pveV9fZAwZDZD"
    },
    {
      "name": "Alexa Fitzgerald",
      "user_id": "28547776571521138",
      "token": "THAAUHgwPgYZC5BYlpSd2F4V3p5WlBrY1ZAkQi1fb2VXMXdKb2ZARTGVXRmZA0ZAF9HanRKcEN4VDh3dER0ZAFFMM3l4MldRcEFNRWxHNWdBMC1ORnpjaU9icGdoT1FfX1R5QjNXQS1kMHhXc25xaENuY0NoaUFHLUk1OHhyelpYVjNQYWs4dwZDZD"
    },
    {
      "name": "Faye Cline",
      "user_id": "28153286724339870",
      "token": "THAAUHgwPgYZC5BYlloaThaZAjh0TUp4R0NRUmM1N2gtcnRNQ0RHbnVpZAGlqdy1Fdnd1U0t2V0VUWlJJVW9vM19hYWVrYmxObkJYZAndfQ0YxVnVUZA0VtTTIxNDBONHlveE1ySXdocElqS2huamtBYi1tWjNuZAEZAUeGs3dEt6SHNsUGQ0QQZDZD"
    },
    {
      "name": "Cullen Reyes",
      "user_id": "27669839782693594",
      "token": "THAAUHgwPgYZC5BYmE0czhVbm1qaTJYb0ptak9rS0V1ajQyYlFXakdRRl9rZAEY4emtrWmhGc2VtUmNpMzBjWWh4RnhTY2ZAZAelYycG02bzFRbzFHd3M5eUVNaTB4NElrazNLYzJfUDNsNWZAkZAUNxcmFXVG91S3VzX0tjUWpsRGZA3NlI3ZAwZDZD"
    }
        ];

        const managedUsernames = ACCOUNTS.map(a => a.username?.toLowerCase()).filter(Boolean);

        if (Array.isArray(body.values)) {
          for (const item of body.values) {
            if (item.field === "replies" && item.value) {
              const commentId = item.value.id;
              const commenter = (item.value.username || "").toLowerCase();
              const ownerId = item.value.root_post?.owner_id;

              // 🛑 防線 1：檢查留言者是否為受控機器人
              if (managedUsernames.includes(commenter)) {
                console.log(`[防循環] 留言者 ${commenter} 為受控帳號，略過`);
                continue;
              }

              // 🛑 防線 2：使用 Cloudflare 全域快取去重鎖（跨節點共享）
              const cache = caches.default;
              const cacheKey = new Request(`https://lock.internal/comment/${commentId}`);
              const alreadyProcessed = await cache.match(cacheKey);

              if (alreadyProcessed) {
                console.log(`[全域去重攔截] 留言 ID: ${commentId} 已在快取中，略過重複請求`);
                continue;
              }

              // 立即寫入快取鎖定 120 秒
              const lockResponse = new Response("locked", {
                headers: { "Cache-Control": "max-age=120" }
              });
              ctx.waitUntil(cache.put(cacheKey, lockResponse));

              // 尋找貼文作者
              const postOwner = ACCOUNTS.find(acc => acc.user_id === ownerId);
              if (postOwner) {
                console.log(`[觸發回覆] 由作者 [${postOwner.name}] 執行背景回覆...`);
                // 將耗時的 API 呼叫交給背景非同步處理，不阻塞當前回應
                ctx.waitUntil(autoReply(commentId, postOwner.user_id, postOwner.token));
              }
            }
          }
        }

        // 立即回傳 200，通知 Meta 已收到，不再觸發重傳
        return new Response("EVENT_RECEIVED", { status: 200 });
      } catch (error) {
        console.log("Webhook 處理異常:", error);
        return new Response("Error", { status: 500 });
      }
    }

    return new Response("🤖 OSC168 Threads Webhook OK!", { status: 200 });
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
