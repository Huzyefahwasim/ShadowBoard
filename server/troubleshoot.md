# Troubleshooting Connection Issues

If your frontend says "failed to connect", follow these steps:

## 1. Verify Server is Running

On the **server laptop**, check if the server is running:
```bash
ps aux | grep "bun.*index"
```

If not running, start it:
```bash
cd /path/to/sovereign-suite
bun run index.ts
```

You should see:
```
🚀 Sovereign Suite Backend running:
   Local:   http://localhost:3000
   Network: http://YOUR_IP:3000
   Use the Network URL from your other laptop!
```

## 2. Verify Correct IP Address

On the **server laptop**, get the current IP:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1 | head -1
```

Or check the server startup message - it shows the Network URL.

**Important**: Make sure you're using the IP from the **wlan0** or **eth0** interface (your WiFi/Ethernet), NOT docker0 or other virtual interfaces.

## 3. Test Connection from Server Laptop

On the **server laptop**, test if the server responds:
```bash
curl http://YOUR_IP:3000/health
# Should return: {"status":"ok","timestamp":"...","server":"Sovereign Suite API"}
```

## 4. Test Connection from Frontend Laptop

On the **frontend laptop**, test if you can reach the server:
```bash
# Replace YOUR_IP with the actual IP from step 2
curl http://YOUR_IP:3000/health

# Or use ping to test network connectivity
ping YOUR_IP
```

**If this fails**, the issue is network connectivity, not the server.

## 5. Check Firewall

On the **server laptop**, open port 3000:

**Linux (ufw):**
```bash
sudo ufw allow 3000
sudo ufw status
```

**Linux (firewalld):**
```bash
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

**Arch Linux (iptables):**
```bash
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

## 6. Verify Both Laptops are on Same Network

Both laptops must be on the **same WiFi network** or connected to the same router.

Check on frontend laptop:
```bash
# Should show similar network range (e.g., 172.29.x.x or 192.168.x.x)
ip addr show | grep "inet "
```

## 7. Check Frontend Code

Make sure your frontend is using the correct URL format:

```javascript
// ✅ Correct
const API_URL = "http://172.29.104.128:3000";

// ❌ Wrong - missing http://
const API_URL = "172.29.104.128:3000";

// ❌ Wrong - using localhost from other laptop
const API_URL = "http://localhost:3000";
```

## 8. Browser Console Errors

Check the browser console (F12) on your frontend laptop for specific error messages:

- **"Failed to fetch"** or **"Network error"**: Server not reachable (firewall/network issue)
- **"CORS error"**: CORS configuration issue (shouldn't happen with our setup)
- **"Connection refused"**: Server not running or wrong IP

## 9. Test with curl from Frontend Laptop

If curl works but your frontend doesn't, the issue is in your frontend code:

```bash
# Test GET request
curl http://YOUR_IP:3000/

# Test POST request
curl -X POST http://YOUR_IP:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"idea": "test"}'
```

## 10. Common Issues

### Issue: IP Address Changed
**Solution**: Restart the server to see the new IP, or check manually with `ip addr show`

### Issue: Server Crashed
**Solution**: Check server logs, restart the server

### Issue: Port Already in Use
**Solution**: 
```bash
# Find what's using port 3000
lsof -i :3000
# Kill it or change PORT environment variable
```

### Issue: VPN or Network Isolation
**Solution**: Disable VPN or ensure both devices are on the same physical network

## Still Not Working?

1. Try accessing `http://YOUR_IP:3000` directly in a browser on the frontend laptop
2. Check if the server laptop has any network restrictions
3. Try a different port (set `PORT=3001` and restart server)
4. Check server logs for any error messages


