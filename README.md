# fivem-player-list

> [\!NOTE]  
> Please note that this project is not currently under active development by me. While I am not personally planning to implement new features or changes, I welcome community contributions. Feel free to fork the repository and submit a pull request with your improvements. I will review all submissions as they come in.

Simple website that displays all players connected to a selected server.
Available here: [https://igorovh.github.io/fivem-player-list/](https://igorovh.github.io/fivem-player-list/)

It uses the FiveM endpoint, which is also used in their UI:

```
https://frontend.cfx-services.net/api/servers/single/serverId
```

# How to get Server ID?

### Server Browser

Visit the [FiveM Server Browser](https://servers.fivem.net/) and click on your chosen server.  
Then look at the URL and copy the last fragment, which is the **Server ID**. Example:  
`https://servers.fivem.net/servers/detail/vp4rxq` -\> **vp4rxq** 

### Client

Find the server in the FiveM client and click on it.  
On the right side you will see a "join URL", where the last fragment is the **Server ID**. Example:
`cfx.re/join/vp4rxq` -\> **vp4rxq**
