import { EventEmitter } from "events";
import request = require("request-promise");

import { Card, CardFilter, PaginationFilter, Set, SetFilter } from "./IMagic";
export { Card, CardFilter, Set, SetFilter, PaginationFilter };

const endpoint = "https://api.magicthegathering.io/v1";


function MakeQuery<T>(queryFor: string) {
	return {
		async all () {
			const result = await request({
				uri: `${endpoint}/${queryFor}`,
				json: true,
			}) as any;
			return (queryFor in result ? result[queryFor] : queryFor) as T;
		},
	};
}

export class MagicEmitter<T> extends EventEmitter {
	private _cancelled = false;
	get cancelled () {
		return this._cancelled;
	}

	public on (event: "data", listener: (data: T) => any): this;
	public on (event: "end", listener: () => any): this;
	public on (event: "cancel", listener: () => any): this;
	public on (event: "error", listener: (err: Error) => any): this;
	public on (event: string, listener: (...args: any[]) => any) {
		super.on(event, listener);
		return this;
	}

	public emit (event: "data", data: T): boolean;
	public emit (event: "end"): boolean;
	public emit (event: "cancel"): boolean;
	public emit (event: "error", error: Error): boolean;
	public emit (event: string, ...data: any[]) {
		return super.emit(event, ...data);
	}

	public cancel () {
		this._cancelled = true;
	}
}

export class ApiQuery<ResultType = any, FilterType = any> {
	constructor(protected queryFor: string) { }

	public async find (id: string) {
		return (await request({
			uri: `${endpoint}/${this.queryFor}/${id}`,
			json: true,
		}) as any)[this.queryFor.slice(0, -1)] as ResultType;
	}

	public async where (filter: FilterType) {
		return (await request({
			uri: `${endpoint}/${this.queryFor}`,
			qs: filter,
			json: true,
		}) as any)[this.queryFor] as ResultType[];
	}

	public all (filter?: FilterType & PaginationFilter) {
		const emitter = new MagicEmitter<ResultType>();

		const getPage = (page = 1) => {
			request({
				uri: `${endpoint}/${this.queryFor}`,
				qs: Object.assign({}, filter, { page }),
				json: true,
			}).then((data: any) => {
				const items: ResultType[] = data[this.queryFor];
				if (items.length > 0) {
					for (const item of items) {
						emitter.emit("data", item);
						if (emitter.cancelled) return emitter.emit("cancel");
					}
					if (items.length == (filter.pageSize || 100)) return getPage(page + 1);
				}
				emitter.emit("end");
			}).error((err) => emitter.emit("error", err));
		};

		getPage(filter.page);

		return emitter;
	}
}

export class SetQuery extends ApiQuery<Set, SetFilter> {
	constructor() {
		super("sets");
	}

	public async generateBooster (setId: string) {
		return (await request({
			uri: `${endpoint}/sets/${setId}/booster`,
			json: true,
		}) as any).cards as Card[];
	}
}

export const Cards = new ApiQuery<Card, CardFilter>("cards");
export let Sets = new SetQuery;

export const Types = MakeQuery<string[]>("types");
export const Subtypes = MakeQuery<string[]>("subtypes");
export const Supertypes = MakeQuery<string[]>("supertypes");
export const Formats = MakeQuery<string[]>("formats");