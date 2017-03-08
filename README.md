# shoutbot
A bot for making regular announcements.

## Usage
Use `/set <time>;<message>` to set a new shout or change the time interval for an existing one.

`<time>` is the duration between shouts in the format `1d2h3m4s`
- e.g. `2.5h` will have the shout posted every two and a half hours

`<message>` is simply what you want the bot to shout out
 
 Use `/unset <message>` to remove a shout, based on the message that the shout was set with originally.
 
 You can manually configure the shouts by editing the`SHOUTS.json` file that will be generated and restarting the bot.
 
 Shouts are specific to the channel they are set in, and will not be shouted anywhere else.