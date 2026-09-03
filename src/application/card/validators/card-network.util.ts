export type CardNetwork =
    | 'Visa'
    | 'Mastercard'
    | 'American Express'
    | 'Discover'
    | 'JCB'
    | 'Diners Club'
    | 'UnionPay'
    | 'Maestro'
    | 'Unknown';

interface CardNetworkRule {
    name: CardNetwork;
    pattern: RegExp;
    lengths: number[];
}

const CARD_NETWORK_RULES: CardNetworkRule[] = [
    {
        name: 'American Express',
        // Starts with 34 or 37
        pattern: /^3[47]/,
        lengths: [15],
    },
    {
        name: 'Diners Club',
        // Starts with 300-305, 36, or 38
        pattern: /^3(?:0[0-5]|[68])/,
        lengths: [14],
    },
    {
        name: 'Discover',
        // Starts with 6011, 622126–622925, 644–649, 65
        pattern: /^6(?:011|5\d{2}|4[4-9]\d|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d{2}|9(?:[01]\d|2[0-5])))/,
        lengths: [16, 19],
    },
    {
        name: 'JCB',
        // Starts with 3528–3589
        pattern: /^35(?:2[89]|[3-8]\d)/,
        lengths: [16],
    },
    {
        name: 'Maestro',
        // Starts with 6304, 6759, 6761, 6762, 6763
        pattern: /^(?:6304|6759|6761|6762|6763)/,
        lengths: [12, 13, 14, 15, 16, 17, 18, 19],
    },
    {
        name: 'UnionPay',
        // Starts with 62 (but not matching Discover's 622126–622925)
        pattern: /^62/,
        lengths: [16, 17, 18, 19],
    },
    {
        name: 'Mastercard',
        // Starts with 51–55 or 2221–2720
        pattern: /^(?:5[1-5]|2(?:2[2-9]\d|[3-6]\d{2}|7[01]\d|720))/,
        lengths: [16],
    },
    {
        name: 'Visa',
        // Starts with 4
        pattern: /^4/,
        lengths: [13, 16, 19],
    },
];

export interface CardNetworkInfo {
    network: CardNetwork;
    isValidLength: boolean;
}


export function detectCardNetwork(cardNumber: string): CardNetworkInfo {
    const sanitized = cardNumber.replace(/[\s-]/g, '');
    const len = sanitized.length;

    for (const rule of CARD_NETWORK_RULES) {
        if (rule.pattern.test(sanitized)) {
            return {
                network: rule.name,
                isValidLength: rule.lengths.includes(len),
            };
        }
    }

    return { network: 'Unknown', isValidLength: false };
}
