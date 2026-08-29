// AI Letter Writer Simulator
// Provides high-quality, touching, and beautifully formatted letters in multiple Indian contexts and tones.

interface LetterTemplateInput {
  recipientName: string;
  senderName: string;
  customPrompt: string;
}

const TEMPLATES: Record<string, Record<string, (input: LetterTemplateInput) => string>> = {
  'Love': {
    'Romantic': ({ recipientName, senderName, customPrompt }) => `My Dearest ${recipientName},

They say some feelings are too deep to be compressed into a WhatsApp message, and today, I felt that with all my heart. As I write these words on this paper, I find myself thinking about all the little moments that make up our story.

${customPrompt ? `I was thinking about how ${customPrompt}. ` : ''}Your laughter is the anchor that holds me steady through life's storms, and your presence is a quiet comfort I never knew I needed. 

Holding this letter, I hope you feel the warmth of my thoughts traveling to you. Distance may separate us by miles, but in every heartbeat, you are right here with me. You are my home, my love, and my favorite adventure.

With all my love and a heart full of promises,

${senderName}`,

    'Heartfelt': ({ recipientName, senderName, customPrompt }) => `Dear ${recipientName},

Writing this letter feels like sending a piece of my soul to you. In a world that moves too fast, I wanted to pause and write down what you truly mean to me.

${customPrompt ? `Every time I think about ${customPrompt}, I am reminded of how lucky I am. ` : 'You have this quiet way of bringing light into my dark days, of making me smile when I forget how. '}Thank you for being my constant, my confidant, and my safest harbor.

I hope when you hold this paper in your hands, you feel the depth of my gratitude and the love that goes with it. You are one of the greatest blessings of my life.

Always yours,

${senderName}`
  },
  'Birthday': {
    'Heartfelt': ({ recipientName, senderName, customPrompt }) => `Dearest ${recipientName},

Today, as you celebrate another beautiful year of your journey, I wanted to send you something you can hold, read, and keep for years to come. Happy Birthday!

${customPrompt ? `I cherish the memory of ${customPrompt} so much, and today is the perfect day to celebrate it. ` : 'Looking back at the past year, I am in absolute awe of the person you have become. '}You carry so much grace, kindness, and strength in everything you do. 

May this year bring you the quiet peace you deserve, the wild laughter that heals the heart, and the fulfillment of your deepest dreams. Keep shining, and remember that you are loved beyond measure.

With warmest birthday wishes,

${senderName}`,

    'Funny': ({ recipientName, senderName, customPrompt }) => `Happy Birthday, ${recipientName}!

Yes, you are reading this correctly. A real, physical, paper letter has arrived to commemorate your aging process. I decided that a digital text was far too cheap for someone of your historical value.

${customPrompt ? `Just like the time we ${customPrompt}, I hope we make even more ridiculous memories this year. ` : 'Another year older, wiser, and slightly more opinionated! '}I hope the carrier pigeon didn't complain about the heavy cargo of your years.

Have an absolute blast today. Eat too much cake, ignore your responsibilities, and enjoy being celebrated!

Cheers to aging disgracefully together,

${senderName}`
  },
  'Apology': {
    'Heartfelt': ({ recipientName, senderName, customPrompt }) => `Dear ${recipientName},

I am writing this because sometimes my voice fails me when I need it most, and I wanted to make sure my words were clear, deliberate, and honest. I am truly sorry for my actions.

${customPrompt ? `Regarding ${customPrompt}, I recognize that I behaved poorly and caused you pain. ` : 'I know I let you down, and seeing the hurt in your eyes broke something inside me. '}Our bond is far too precious to me to let my mistakes stand in the way. 

Please take all the time you need. I hope this physical message conveys the sincerity of my regret. I value you more than words can express, and I hope we can heal from this.

With sincere regrets,

${senderName}`
  },
  'Friendship': {
    'Friendly': ({ recipientName, senderName, customPrompt }) => `Hey ${recipientName},

Just a little note arriving out of the blue to remind you of how much our friendship means to me. We spend so much time texting, but there is something beautiful about putting pen to paper for a true friend.

${customPrompt ? `I was just reminiscing about ${customPrompt} and it instantly brought a smile to my face. ` : 'Through all the highs and lows, you have been the one person I can always count on for honest advice and endless laughs. '}

Thank you for being the brother/sister I got to choose. Let's make time to catch up soon. Until then, keep this letter on your desk as a reminder that someone is rooting for you!

Your friend forever,

${senderName}`
  },
  'Thank You': {
    'Heartfelt': ({ recipientName, senderName, customPrompt }) => `Dear ${recipientName},

I am sending this letter to express a gratitude that a simple 'thank you' text cannot do justice. 

${customPrompt ? `Your support during ${customPrompt} meant the absolute world to me. ` : 'When I was going through a rough patch, your kindness was a guiding light. '}You showed up for me without hesitation, and I will never forget it.

This letter is a small token of my appreciation. Thank you for your warmth, your generosity, and your beautiful heart.

With deep gratitude,

${senderName}`
  }
};

const DEFAULT_TEMPLATE = ({ recipientName, senderName, customPrompt, occasion }: LetterTemplateInput & { occasion: string }) => `Dear ${recipientName},

I wanted to take a moment to write this letter to you. In our busy, digital lives, we rarely take the time to put down our thoughts on paper, but I believe some messages deserve to be felt and kept.

${customPrompt ? `I am writing to you about ${customPrompt}. ` : `I wanted to reach out to you on this occasion of ${occasion} and send my warmest thoughts. `}

I hope this physical letter brings a smile to your face and serves as a gentle reminder of the bond we share.

Warmest regards,

${senderName}`;

/**
 * Simulates AI letter generation.
 */
export function generateLetterDraft(
  occasion: string,
  tone: string,
  length: string,
  prompt: string,
  recipientName: string,
  senderName: string
): string {
  const normalizedOccasion = occasion || 'Just Because';
  const normalizedTone = tone || 'Heartfelt';
  
  const recipient = recipientName.trim() || 'my friend';
  const sender = senderName.trim() || 'Someone who cares';
  const customPrompt = prompt.trim();

  // Try to find matching template
  const occasionTemplates = TEMPLATES[normalizedOccasion];
  const templateFn = occasionTemplates ? occasionTemplates[normalizedTone] || occasionTemplates['Heartfelt'] : null;

  let text = '';
  if (templateFn) {
    text = templateFn({ recipientName: recipient, senderName: sender, customPrompt });
  } else {
    text = DEFAULT_TEMPLATE({ recipientName: recipient, senderName: sender, customPrompt, occasion: normalizedOccasion });
  }

  // Adjust length
  if (length === 'Short') {
    // Truncate some paragraphs or return a summarized version
    const paragraphs = text.split('\n\n');
    if (paragraphs.length > 3) {
      text = `${paragraphs[0]}\n\n${paragraphs[1]}\n\n${paragraphs[paragraphs.length - 1]}`;
    }
  } else if (length === 'Long') {
    // Add extra emotional padding
    const paragraphs = text.split('\n\n');
    if (paragraphs.length >= 3) {
      const closing = paragraphs.pop();
      const body = paragraphs.join('\n\n');
      const extraParagraph = `In this modern era where everything is transient, fleeting, and digital, holding this parchment feels like capturing time itself. Every stroke, every word, and every fold is a conscious choice, a slow and deliberate act of care. I wanted you to have something permanent, something you can tuck away in a drawer and stumble upon years from now, recalling this exact moment.`;
      text = `${body}\n\n${extraParagraph}\n\n${closing}`;
    }
  }

  return text;
}
