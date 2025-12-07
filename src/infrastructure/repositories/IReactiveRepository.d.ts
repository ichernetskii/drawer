export interface IReactiveRepository {
	subscribe(listener: () => void): () => void;
}
