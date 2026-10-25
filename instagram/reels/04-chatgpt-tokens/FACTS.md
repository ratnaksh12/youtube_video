# Facts behind Reel 04 (how ChatGPT writes a sentence)

Checked 25 Oct 2026.

| Line | Claim | Source |
|---|---|---|
| l01–l02 | ChatGPT doesn't know what it's going to say; it guesses one piece at a time | Language models like ChatGPT generate text autoregressively: one token at a time, each chosen from a probability distribution over the next token. With sampling on, the exact words aren't fixed until each token is drawn |
| l03–l04 | Text is chopped into tokens, about ¾ of a word each | OpenAI Help Center, "What are tokens and how to count them?" (article 4936856): in English, 1 token ≈ 4 characters ≈ ¾ of a word; 100 tokens ≈ 75 words. Tokenization varies by model |
| l05 | It scores every token it knows and asks what comes next | The model outputs a score (logit) for every token in its vocabulary; softmax turns them into probabilities for the next position |
| l06 | "The cat sat on the… mat 60%, floor 10%, moon almost zero" | **Illustration.** Example numbers that show the idea, not output from a real model (stated in the caption) |
| l07–l08 | It adds the token and repeats, hundreds of times per answer | Autoregressive generation feeds each new token back in. A typical few-hundred-word answer is several hundred tokens (100 tokens ≈ 75 words) |
| l09–l10 | It doesn't always pick the top one; temperature adds randomness so it doesn't sound robotic | OpenAI API docs: "Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic." Always taking the most likely word (greedy decoding) tends to produce bland, repetitive text: Holtzman et al. 2019, "The Curious Case of Neural Text Degeneration" (arXiv:1904.09751) |
| l11 | The same question can get a different answer every time | It follows from sampling. OpenAI also notes its API is non-deterministic by default |
| l12 | A free tool that shows how ChatGPT splits your words | OpenAI Tokenizer, https://platform.openai.com/tokenizer |

On screen: the split "Token | ization | is | unbeliev | ably | weird" is an **illustration** (marked on the monitor); real splits depend on the model's tokenizer. The token counter's "#400" stands for "hundreds".
