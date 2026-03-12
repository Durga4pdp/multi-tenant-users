// ============================================================
// app.js — Multi-Tenant Node.js App with Kafka Integration
// ============================================================

'use strict';

// ── 1. IMPORTS ───────────────────────────────────────────────
const express = require('express');
const { Kafka } = require('kafkajs');

// ── 2. CONFIG ────────────────────────────────────────────────
const PORT      = process.env.PORT      || 3000;
const USER_NAME = process.env.USER_NAME || 'unknown';
const KAFKA_BROKER = process.env.KAFKA_BROKER || '74.225.253.132:9092';

// ── 3. KAFKA SETUP ───────────────────────────────────────────
const kafka    = new Kafka({ brokers: [KAFKA_BROKER] });
const producer = kafka.producer();

async function publishDeploymentEvent(user) {
  try {
    await producer.connect();
    await producer.send({
      topic: 'deployment-events',
      messages: [
        {
          value: JSON.stringify({
            event:     'WebsiteCreated',
            user:      user,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`[Kafka] Event published for user: ${user}`);
  } catch (err) {
    console.error('[Kafka] Failed to publish event:', err.message);
  } finally {
    await producer.disconnect();
  }
}

// ── 4. EXPRESS APP ───────────────────────────────────────────
const app = express();

// Route: Home
app.get('/', (req, res) => {
  res.send(`
    <h1>Hello from ${USER_NAME}'s website!</h1>
    <p>Pod: ${process.env.HOSTNAME}</p>
  `);
});

// Route: Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', user: USER_NAME });
});

// ── 5. START SERVER ──────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`[Server] Running on port ${PORT} — user: ${USER_NAME}`);
  await publishDeploymentEvent(USER_NAME);
});
