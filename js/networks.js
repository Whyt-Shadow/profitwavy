// networks.js
const GHANA_NETWORKS = {
    MTN: {
        prefixes: ['024', '054', '055', '059','053','025'],
        name: 'MTN Mobile Money',
        code: 'mtn',
        icon: 'fas fa-mobile-alt',
        color: '#FFC107'
    },
    VODAFONE: {
        prefixes: ['020', '050'],
        name: 'Vodafone Cash',
        code: 'vodafone',
        icon: 'fas fa-signal',
        color: '#E60000'
    },
    AIRTELTIGO: {
        prefixes: ['027', '057', '026', '056'],
        name: 'AirtelTigo Money',
        code: 'airteltigo',
        icon: 'fas fa-wifi',
        color: '#E30613'
    }
};

function detectNetwork(phone) {
    if (!phone || phone.length < 3) return null;
    
    const prefix = phone.substring(0, 3);
    
    for (const [key, network] of Object.entries(GHANA_NETWORKS)) {
        if (network.prefixes.includes(prefix)) {
            return network;
        }
    }
    
    return null;
}