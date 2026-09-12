const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Parses an image of a receipt using Google Gemini 1.5 Vision
 * @param {string} base64Data - Raw base64 data without data:image/... prefix
 * @param {string} mimeType - e.g. 'image/jpeg', 'image/png'
 * @returns {Promise<{ amount: number, category: string, description: string, date: string }>}
 */
const scanReceiptImage = async (base64Data, mimeType = 'image/jpeg') => {
  if (!base64Data) {
    throw new Error('Image data is required');
  }

  // Remove data URL prefix if included
  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

  const prompt = `
You are an expert financial receipt scanner for an expense sharing application.
Analyze this receipt image and extract the following details accurately:
1. Total amount (as a number with 2 decimal places).
2. Category: MUST be exactly one of: ["Rent", "Groceries", "Utilities", "Internet", "Cooking Gas", "Entertainment", "Other"].
3. Description: A concise, human-readable summary of the merchant or items (e.g. "Trader Joe's groceries", "Starbucks coffee", "Electricity bill").
4. Date: The transaction date in ISO YYYY-MM-DD format if visible, or null if not found.

Return ONLY a valid, raw JSON object with this exact structure (no backticks, no markdown, no comments):
{
  "amount": 45.50,
  "category": "Groceries",
  "description": "Trader Joe's groceries",
  "date": "2026-09-09"
}
`;

  const imagePart = {
    inlineData: {
      data: cleanBase64,
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const responseText = result.response.text().trim();

  // Strip markdown code fences if model enclosed JSON in ```json ... ```
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse structured expense information from the receipt');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Sanitize values
  const allowedCategories = ['Rent', 'Groceries', 'Utilities', 'Internet', 'Cooking Gas', 'Entertainment', 'Other'];
  const category = allowedCategories.includes(parsed.category) ? parsed.category : 'Other';
  const amount = Math.abs(parseFloat(parsed.amount)) || 0;

  return {
    amount: parseFloat(amount.toFixed(2)),
    category,
    description: parsed.description || 'Scanned receipt expense',
    date: parsed.date || new Date().toISOString().split('T')[0],
  };
};

module.exports = { scanReceiptImage };
