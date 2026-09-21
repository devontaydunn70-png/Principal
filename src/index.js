require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if Principal Bot is online."),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Show information about this server."),

  new SlashCommandBuilder()
    .setName("build")
    .setDescription("Tell Principal Bot how you want your server built.")
    .addStringOption(option =>
      option
        .setName("prompt")
        .setDescription("Describe the server setup you want.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    console.log("Registering slash commands...");

    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands.map(command => command.toJSON()) }
      );

      console.log("Guild commands registered.");
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands.map(command => command.toJSON()) }
      );

      console.log("Global commands registered.");
    }
  } catch (error) {
    console.error("Command registration failed:", error);
  }
}

client.once("ready", () => {
  console.log(`Principal Bot is online as ${client.user.tag}`);
  console.log(`Serving ${client.guilds.cache.size} server(s).`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    return interaction.reply({
      content: `🏫 Principal Bot is online!\nLatency: ${client.ws.ping}ms`
    });
  }

  if (interaction.commandName === "serverinfo") {
    const guild = interaction.guild;

    return interaction.reply({
      content:
        `🏫 **${guild.name}**\n` +
        `👥 Members: ${guild.memberCount}\n` +
        `🆔 Server ID: ${guild.id}\n` +
        `📁 Channels: ${guild.channels.cache.size}\n` +
        `🎭 Roles: ${guild.roles.cache.size}`
    });
  }

  if (interaction.commandName === "build") {
    const prompt = interaction.options.getString("prompt");

    await interaction.reply({
      content:
        `🏗️ **Principal Bot received your build request.**\n\n` +
        `> ${prompt}\n\n` +
        `⚙️ Server Builder is being prepared.`
    });
  }
});

async function start() {
  if (!process.env.DISCORD_TOKEN) {
    console.error("Missing DISCORD_TOKEN in .env");
    process.exit(1);
  }

  if (!process.env.CLIENT_ID) {
    console.error("Missing CLIENT_ID in .env");
    process.exit(1);
  }

  await registerCommands();
  await client.login(process.env.DISCORD_TOKEN);
}

start();
