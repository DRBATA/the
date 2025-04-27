// Ensures both /api/stripe-webhook and /api/stripe-webhook/ resolve to the same handler
import handler from '../stripe-webhook';

export default handler;
