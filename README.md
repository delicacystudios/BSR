# BSR Bot

**BSR Bot** is a powerful and flexible Discord bot with a ticket system designed for clan recruitment, administration requests, and other tasks. It provides a convenient control panel with buttons for quick interaction with users and processing requests.

## ⚙️ Features

- 🎫 **Ticket System**  
  Create tickets by pressing a button. Suitable for requests to join a clan, questions to the administration, etc.

- 🖱️ **Paneled-Embeds**  
  Convenient response system directly in the ticket. The administration can quickly respond, close or redirect tickets using customizable buttons.

- ⌨️ **Slash Commands**  
  Support for modern slash commands for interacting with the bot (e.g. `/setup`, `/reply`, `/close`, etc.).

- ⚙️ **Customizable config**  
  All settings, from button names to ticket behavior, can be changed via the configuration file.

- 🛠️ **Flexible Settings**  
  Any changes in the logic of work, display, roles and channels can be made through the config without the need to change the source code.

## 📦 System requirements
- **Node.JS** - v20
- **Discord.JS** - v14.8.0+

## 📦 Installing

1. Clone the repository:
   ```bash
   git clone https://github.com/delicacystudios/BSR.git
   cd BSR
   npm install
   ```
2. Set up the `config.js` (Default version):
   ```bash
   module.exports = {
        bot: {
          token: '',
          prefix: 'b/',
          clientID: '',
          db: ''
        },
    
        serverID: '',

        message: {
          colors: {
            main: '#ff522f',
            warn: 'YELLOW',
            error: '#ff0000'
          },

          footer: 'BSR © Все права защищены!'
        },

        roles: {
          Leader: '',
          Caller: '',
          Combat: '',
          Farmila: '',
          Farmer: '',
          Electro: '',
          Builder: '',
          member: ''
       }
   }
   ```

