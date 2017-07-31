import { EventEmitter } from "events";
import request = require("request-promise");

import { Card, Set, CardFilter, SetFilter, PaginationFilter } from "./IMagic";
export { Card, Set, CardFilter, SetFilter, PaginationFilter };

const endpoint = "https://api.magicthegathering.io/v1";


function MakeQuery<T>(queryFor: string) {
	return {
		async all () {
			const result = await request({
				uri: `${endpoint}/${queryFor}`,
				json: true,
			}) as any;
			return (queryFor in result ? result[queryFor] : queryFor) as T;
		}
	};
}

export class MagicEmitter<T> extends EventEmitter {
	private _cancelled = false;
	get cancelled () {
		return this._cancelled;
	}

	on (event: "data", listener: (this: this, data: T) => any): this;
	on (event: "end", listener: (this: this) => any): this;
	on (event: "error", listener: (this: this, err: Error) => any): this;
	on (event: string, listener: (this: this, ...args: any[]) => any) {
		super.on(event, listener);
		return this;
	}

	emit (event: "data", data: T): boolean;
	emit (event: "end"): boolean;
	emit (event: "error", error: Error): boolean;
	emit (event: string, ...data: any[]) {
		return super.emit(event, ...data);
	}

	cancel () {
		this._cancelled = true;
	}
}

export class ApiQuery<ResultType = any, FilterType = any> {
	constructor(protected queryFor: string) { }

	async find (id: string) {
		return (await request({
			uri: `${endpoint}/${this.queryFor}/${id}`,
			json: true,
		}) as any)[this.queryFor.slice(0, -1)] as ResultType;
	}

	async where (filter: FilterType) {
		return (await request({
			uri: `${endpoint}/${this.queryFor}`,
			qs: filter,
			json: true,
		}) as any)[this.queryFor] as ResultType[];
	}

	all (filter?: FilterType & PaginationFilter) {
		const emitter = new MagicEmitter<ResultType>();

		const getPage = (page = 1) => {
			request({
				uri: `${endpoint}/${this.queryFor}`,
				qs: Object.assign({}, filter, { page }),
				json: true,
			}).then((data: any) => {
				const items: ResultType[] = data[this.queryFor];
				if (items.length > 0) {
					for (const item of items) emitter.emit("data", item);
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

	async generateBooster (setId: string) {
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