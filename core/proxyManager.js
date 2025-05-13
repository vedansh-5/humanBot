require('dotenv').config();

module.exports.getOxylabsProxy = () => {
    // Validate environment variables
    if (!process.env.PROXY_URL || !process.env.PROXY_USERNAME || !process.env.PROXY_PASSWORD) {
        throw new Error('Missing proxy environment variables');
    }

    // Format the proxy configuration
    const proxyConfig = {
        proxyUrl: process.env.PROXY_URL,  // Using HTTPS for the new endpoint
        username: process.env.PROXY_USERNAME,
        password: process.env.PROXY_PASSWORD.replace(/\+/g, '%2B')
    };

    console.log('Proxy configuration:', {
        proxyUrl: proxyConfig.proxyUrl,
        username: proxyConfig.username,
        password: '********'
    });

    return proxyConfig;
};