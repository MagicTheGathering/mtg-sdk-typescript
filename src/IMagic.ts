export enum Color {
	White,
	Blue,
	Black,
	Red,
	Green,
}
export enum ColorIdentity {
	W, U, B, R, G,
}
export enum Rarity {
	"Basic Land",
	Common,
	Uncommon,
	"Mythic Rare",
	Timeshifted,
	Masterpiece,
}
export enum Layout {
	normal,
	split,
	flip,
	"double-faced",
	token,
	plane,
	scheme,
	phenomenon,
	leveler,
	vanguard,
}
export enum Legality {
	Legal,
	Banned,
	Restricted,
}

export interface BlockLegality {
	format: string;
	legality: keyof typeof Legality;
}

export interface Card {
	name: string;
	manaCost: string;
	cmc: number;
	colors: (keyof typeof Color)[];
	colorIdentity: (keyof typeof ColorIdentity)[];
	type: string;
	supertypes: string[];
	types: string[];
	subtypes: string[];
	rarity: keyof typeof Rarity;
	set: string;
	setName: string;
	artist: string;
	flavor?: string;
	layout: keyof typeof Layout;
	multiverseid: number;
	imageUrl: string;
	variations: number[];
	printings: string[];
	originalText: string;
	originalType: string;
	legalities: BlockLegality[];
	id: string;
}
export interface CreatureCard {
	power: string;
	toughness: string;
}
export interface PlaneswalkerCard {
	loyalty: number;
}

export interface CardFilter {
	name?: string;
	layout?: string;
	cmc?: number;
	colors?: string;
	colorIdentity?: string;
	type?: string;
	supertypes?: string;
	types?: string;
	subtypes?: string;
	rarity?: string;
	set?: string;
	setName?: string;
	text?: string;
	flavor?: string;
	artist?: string;
	number?: string;
	power?: string;
	toughness?: string;
	loyalty?: number;
	foreignName?: string;
	language?: string;
	gameFormat?: string;
	legality?: keyof typeof Legality;
	page?: number;
	pageSize?: number;
	orderBy?: string;
	random?: boolean;
	contains?: string;
}

export interface PaginationFilter {
	page?: number;
	pageSize?: number;
}

export interface SetFilter {
	name?: string;
	block?: string;
}

export enum SetType {
	core,
	expansion,
	reprint,
	box,
	un,
	"from the vault",
	"premium deck",
	"duel deck",
	starter,
	commander,
	planechase,
	archenemy,
	promo,
	vanguard,
	masters,
}

export enum BoosterCardType {
	marketing,
	land,
	common,
	uncommon,
	rare,
	"mythic rare",
}

export type Booster = (keyof typeof BoosterCardType | (keyof typeof BoosterCardType)[])[];

export interface Set {
	name: string;
	block?: string;
	code: string;
	gathererCode?: string;
	type?: string;
	oldCode?: string;
	magicCardsInfoCode?: string;
	releaseDate: string;
	border: "white" | "black" | "silver";
	expansion: keyof typeof SetType;
	onlineOnly?: true;
	booster?: Booster;
}