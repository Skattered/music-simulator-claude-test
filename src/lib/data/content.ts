/**
 * Music Industry Simulator - Flavor Text & Content
 *
 * Contains all flavor text, descriptions, and narrative content for the game.
 * This includes:
 * - Tech tier descriptions (thematic, satirical)
 * - Exploitation ability descriptions
 * - Phase unlock messages
 * - Prestige flavor text
 * - Victory screen text
 * - Tutorial hints
 *
 * Tone: Satirical commentary on capitalism vs art in the music industry
 * Theme: The progression from independent artist to industry monopolist
 */

/**
 * Tech Tier Flavor Text
 *
 * Each tier has a description that reflects the progression from
 * manual labor to full automation, with increasingly absurd commentary.
 */
export const TECH_TIER_DESCRIPTIONS: Record<number, string> = {
	1: "You're using other people's AI APIs. You pay per song. You have zero control. But hey, at least you're making 'music.'",
	2: "You've graduated to a subscription! Songs are now FREE (after paying $500). The illusion of ownership begins.",
	3: "Welcome to the big leagues. You're running AI locally now. The GPU fans scream, but so does your bank account. Also, you can now abandon this artist and start over. Peak capitalism!",
	4: "Fine-tuning models on your own catalog. Congratulations, you've achieved the ultimate form of narcissism: an AI trained exclusively on yourself.",
	5: "Training models from scratch. You're no longer using AI - you're *becoming* AI. The line between artist and algorithm blurs.",
	6: "You've built your own software stack. Why use someone else's tools when you can waste months reinventing the wheel? At least it's *your* wheel now.",
	7: "AI agents run everything. You've automated yourself out of the creative process entirely. You just watch numbers go up. This is what you wanted, right?"
};

/**
 * Phase Unlock Messages
 *
 * Shown when player unlocks new game phases
 */
export const PHASE_UNLOCK_MESSAGES = {
	physicalAlbums: {
		title: 'Physical Albums Unlocked!',
		message:
			"In the age of infinite digital copies, you've discovered people still pay for plastic discs. Nostalgia is a hell of a drug. Press albums, watch them sell, count your money."
	},
	tours: {
		title: 'Tours & Concerts Unlocked!',
		message:
			"Time to tour! Pack your AI in a suitcase and hit the road. Nothing says 'authentic musical experience' like a robot performing to pre-programmed backing tracks. The fans won't know the difference."
	},
	platformOwnership: {
		title: 'Platform Ownership Available!',
		message:
			"Why make music when you can own the platforms that distribute it? Buy streaming services, control algorithms, manipulate charts. This is where the real money is. Art is dead, long live monopoly."
	},
	fullAutomation: {
		title: 'Full Automation Achieved!',
		message:
			"Congratulations! You've completely removed the human element from music. Your AI agents handle everything. You're not even needed anymore. Peak efficiency. Peak emptiness."
	}
};

/**
 * Prestige Flavor Text
 *
 * Messages shown during prestige (creating new artist)
 */
export const PRESTIGE_MESSAGES = {
	confirmTitle: 'Create New Artist?',
	confirmMessage:
		"Abandon your current artist and start fresh with a new persona. Your old artist becomes a 'legacy act' generating passive income while you chase the next big thing. Just like the real music industry!",
	benefits: {
		title: 'What You Keep:',
		items: [
			'All tech upgrades (your AI expertise)',
			'Industry control progress',
			'Experience multiplier (you know what works now)',
			'Legacy artist passive income (80% of current rate)'
		]
	},
	costs: {
		title: 'What You Lose:',
		items: [
			'All money (back to $10)',
			'All songs',
			'All fans',
			"Your current artist's relevance (they're yesterday's news)"
		]
	},
	warnings: [
		'This cannot be undone',
		'Make sure you really want to start over',
		'The music industry is fickle - today's star is tomorrow's has-been'
	],
	success: {
		title: 'New Artist Created!',
		message:
			"Welcome your new artist! Your old artist has been filed away in the 'Where Are They Now?' category. They'll still generate some income, but the spotlight has moved on. Such is the music industry."
	}
};

/**
 * Victory Screen Content
 *
 * Shown when player reaches 100% industry control
 */
export const VICTORY_CONTENT = {
	title: 'You Control the Music Industry',
	subtitle: 'Congratulations on your monopoly!',
	message:
		"You've done it. You own the platforms, control the algorithms, manipulate the charts, and automate the art. You've turned music into an optimization problem and solved it. Every song is AI-generated. Every artist is disposable. Every decision is data-driven. The soul of music is dead, but hey - look at those numbers!",
	stats: {
		title: 'Your Empire:',
		// Stats filled in dynamically from game state
	},
	reflection:
		"Was it worth it? Did you make the world a better place? Does anyone even care about music anymore, or just the algorithm's recommendation? These are questions you'll never need to answer - you won the game!",
	options: {
		continue: 'Keep Playing (What more do you want?)',
		restart: 'Start Over (Try being an actual artist this time?)'
	}
};

/**
 * Exploitation Ability Descriptions
 *
 * Flavor text for various exploitation mechanics
 */
export const EXPLOITATION_ABILITY_DESCRIPTIONS = {
	botStreams: {
		name: 'Buy Bot Streams',
		description:
			"Pay for fake streams from bot farms. It's not fraud if everyone does it! Temporarily boost your streaming revenue by 50%.",
		flavor: "If a robot listens to a song in the forest, does it make a sound? Who cares - it makes money!"
	},
	playlistPlacement: {
		name: 'Pay for Playlist Placement',
		description:
			"Bribe playlist curators to feature your songs. 'Editorial curation' is just marketing speak for 'who paid us this week.' 2x fan growth for a limited time.",
		flavor: 'Payola never died - it just went digital.'
	},
	socialMediaCampaign: {
		name: 'Social Media Campaign',
		description:
			"Flood social media with fake hype. Hire influencers to pretend they care about your music. Watch the metrics spike!",
		flavor: 'Organic growth is for suckers. Buy your fame like everyone else.'
	},
	limitedEdition: {
		name: 'Limited Edition Variants',
		description:
			"Release 47 different versions of the same album. Colored vinyl. Signed prints. Special Edition Deluxe Ultimate version. The fans will buy them all.",
		flavor: 'Artificial scarcity: capitalism's greatest invention.'
	},
	scalpTickets: {
		name: 'Scalp Own Tickets',
		description:
			"Buy your own concert tickets through bots, then resell them at 500% markup. Cut out the middleman - YOU are the middleman now.",
		flavor: "Why let ticket resellers profit when you can exploit your own fans directly?"
	},
	algorithmManipulation: {
		name: 'Manipulate Algorithm',
		description:
			"Game the recommendation algorithm to push your music. It's not cheating, it's 'growth hacking.' The algorithm rewards those who understand it.",
		flavor: 'The algorithm giveth, and the algorithm can be gamed.'
	},
	chartManipulation: {
		name: 'Chart Manipulation',
		description:
			"Use shady tactics to boost chart positions. Buy bundles with t-shirts. Use VPN farms for different regions. Whatever it takes for that #1 spot.",
		flavor: 'Chart positions are just numbers, and numbers can be... adjusted.'
	},
	astroturfing: {
		name: 'Astroturfing Campaign',
		description:
			"Create fake grassroots fan movements. Hire people to pretend they organically discovered your music. 'Viral' is manufactured.",
		flavor: 'Nothing says authentic like a focus-tested grassroots campaign.'
	}
};

/**
 * Platform Ownership Descriptions
 *
 * Flavor text for buying industry platforms
 */
export const PLATFORM_OWNERSHIP_DESCRIPTIONS = {
	streamingPlatform: {
		name: 'Own Streaming Platform',
		description:
			"Buy a major streaming service. Now you control distribution AND take all the revenue. Artists get pennies per stream. You get billions.",
		flavor: 'Why split revenue with Spotify when you can BE Spotify?'
	},
	algorithmControl: {
		name: 'Control the Algorithm',
		description:
			"Own the recommendation algorithm. Decide what millions hear. Your music mysteriously appears in every playlist. What a coincidence!",
		flavor: 'Whoever controls the algorithm controls the culture. And you control the algorithm.'
	},
	chartManipulation: {
		name: 'Acquire Billboard',
		description:
			"Buy the chart companies. Now you decide what's popular. Your songs are always #1 because you say so. Democracy in action!",
		flavor: "When you own the scoreboard, you always win the game."
	},
	grammyOwnership: {
		name: 'Buy the Grammys',
		description:
			"Purchase the awards academy. Give yourself all the awards. Write your own legacy. History is written by the winners (and the winners pay to win).",
		flavor: 'Award shows were always about money. You just made it explicit.'
	},
	trainingData: {
		name: 'Own AI Training Data',
		description:
			"Control the datasets used to train music AI. Every future AI is trained on YOUR terms. You define what music sounds like for the next generation.",
		flavor: 'He who controls the training data controls the future of music. That's you now.'
	},
	musicRights: {
		name: 'Music Rights Monopoly',
		description:
			"Buy up every music publishing catalog. The Beatles, Mozart, every nursery rhyme - you own it all. Anyone who makes music pays YOU.",
		flavor: 'Creativity is free. Using your ears costs extra.'
	}
};

/**
 * Tutorial Hints
 *
 * Contextual help messages shown during gameplay
 */
export const TUTORIAL_HINTS = {
	firstSong: "Click the button to generate your first song. It costs $1. That's all you have. Welcome to the music industry!",
	techUpgrade: 'Tech upgrades permanently improve your production speed and income. The path to automation begins here.',
	prestige: 'Prestiging lets you start over with a new artist while keeping your tech upgrades and gaining experience multipliers. Your old artist becomes a legacy act generating passive income.',
	physicalAlbums: 'Physical albums provide one-time payouts based on your fanbase. More fans = more variants = more money.',
	tours: 'Tours temporarily multiply ALL your income sources. Time them strategically for maximum profit.',
	platformOwnership: 'Owning platforms is the endgame. Stop making music, start controlling the industry itself.',
	exploitation: 'Exploitation abilities give temporary boosts. Use them strategically to accelerate growth. The costs scale up with each use.',
	industryControl: 'Industry control progress persists through prestige. Reach 100% to win the game and achieve total monopoly.'
};

/**
 * Genre Names
 *
 * Used for trend research system
 */
export const GENRES = [
	'Pop',
	'Hip-Hop',
	'Rock',
	'Electronic',
	'Indie',
	'Jazz',
	'Classical',
	'Country',
	'R&B',
	'Metal',
	'Folk',
	'Latin',
	'K-Pop',
	'EDM',
	'Trap',
	'Lo-Fi',
	'Synthwave',
	'Vaporwave'
];

/**
 * Random Messages
 *
 * Flavor text shown during various game events
 */
export const RANDOM_MESSAGES = {
	songComplete: [
		'Song generated! Add it to the pile.',
		'Another track in the catalog. Quality optional.',
		'Song complete! The algorithm will love this one.',
		"Done! Is it good? Who cares - it's content!",
		'Generated! Just like a real artist, but faster.'
	],
	albumRelease: [
		'Album released! Time to milk the fans.',
		'New album out! Watch the numbers go up.',
		'Album dropped! Collectors edition coming soon.',
		'Release day! 47 variants available now.',
		'Album out! Pre-order the deluxe super mega edition!'
	],
	tourStart: [
		'Tour starting! Pack the AI in a suitcase.',
		'On the road! Nothing says authentic like an algorithm.',
		'Tour begins! The robot needs no rest days.',
		'Hitting the venues! Your AI plays every night.',
		'Tour launched! The automation never tires.'
	],
	milestones: {
		songs100: '100 songs! Quantity over quality, as the algorithm intended.',
		songs1000: "1,000 songs! You're not a musician anymore - you're a content farm.",
		songs10000: '10,000 songs! At this point, who's even listening?',
		fans10k: '10,000 fans! They think this is art. Let them believe.',
		fans100k: '100,000 fans! The algorithm chose them. They never stood a chance.',
		fans1m: '1 MILLION FANS! You've achieved influencer status. Authenticity sold separately.',
		firstPrestige: 'First prestige! Your old artist is already forgotten. Such is fame.',
		firstPlatform: "First platform owned! You're not just a player anymore - you're the game.",
		victory: "You've won! The music industry is yours. Was it worth it? (Don't answer that.)"
	}
};

/**
 * Get random message from array
 *
 * @param messages - Array of messages
 * @returns Random message
 */
export function getRandomMessage(messages: string[]): string {
	return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get genre description
 *
 * @param genre - Genre name
 * @returns Description of genre
 */
export function getGenreDescription(genre: string): string {
	const descriptions: Record<string, string> = {
		Pop: 'Maximum hooks, minimum substance. Perfectly engineered for algorithmic success.',
		'Hip-Hop': 'Beats and bars. Street cred optional when AI does the writing.',
		Rock: 'Guitar-driven... wait, the AI generates guitar sounds? Close enough.',
		Electronic: 'Beeps, boops, and drops. The AI was born for this.',
		Indie: 'Alternative and artisanal. Mass-produced indie music is peak irony.',
		Jazz: 'Improvisation? The AI has calculated every possible note combination.',
		Classical: '400 years of tradition, now available in 30 seconds from an algorithm.',
		Country: 'Trucks, beer, and heartbreak. The AI learned it all from the same 12 songs.',
		'R&B': 'Smooth grooves. The AI auto-tunes better than any human ever could.',
		Metal: 'Aggressive, loud, technical. The AI can shred at 1000 BPM. Can you?',
		Folk: 'Acoustic authenticity, digitally generated. The irony is intentional.',
		Latin: 'Rhythm and passion, calculated to 0.001 BPM precision.',
		'K-Pop': 'Perfectly produced, perfectly choreographed, perfectly artificial.',
		EDM: 'Festival bangers. The AI knows exactly when to drop.',
		Trap: '808s and hi-hats. The AI has mastered the formula.',
		'Lo-Fi': 'Chill beats to study/relax to. Generated in bulk, 24/7.',
		Synthwave: 'Nostalgia for an era that never existed, made by machines that never lived.',
		Vaporwave: 'A e s t h e t i c. The AI ironically generates ironic music.'
	};

	return descriptions[genre] || 'Music of questionable origin and indeterminate quality.';
}
