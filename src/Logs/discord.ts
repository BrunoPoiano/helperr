export const discordChannel = async (log: string): Promise<void> => {
  const discord_url = process.env.DISCORD_URL;
  const discord_username = process.env.DISCORD_USERNAME || "Qbit-Renamer";

  if (!discord_url) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const body = {
    content: log,
    username: discord_username,
  };

  try {
    await fetch(discord_url, {
      signal: controller.signal,
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("Error sending message to Discord channel");
    console.error(error);
    throw Error("Error sending message to Discord channel");
  } finally {
    clearTimeout(timeout);
  }
};
