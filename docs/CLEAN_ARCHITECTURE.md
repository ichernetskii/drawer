# Clean Architecture - Canvas Drawing Application

Этот документ описывает архитектуру приложения для рисования на canvas, реализованную в папке `src_clean_architecture`.

## Содержание

- [Обзор](#обзор)
- [Архитектурные паттерны](#архитектурные-паттерны)
- [Организация слоёв](#организация-слоёв)
- [Domain Layer](#domain-layer)
- [Use Cases Layer](#use-cases-layer)
- [Adapters Layer](#adapters-layer)
- [Infrastructure Layer](#infrastructure-layer)
- [Системы координат](#системы-координат)
- [Поток данных](#поток-данных)
- [State Management](#state-management)
- [Rendering Pipeline](#rendering-pipeline)
- [Добавление новых функций](#добавление-новых-функций)

## Обзор

Приложение — это инструмент для рисования на canvas, позволяющий пользователям создавать и манипулировать геометрическими фигурами (прямоугольники, эллипсы, текст).

**Технологический стек:**

- TypeScript
- Vite (инструмент сборки)
- MobX или Redux (на выбор, две реализации)
- HTML5 Canvas API

## Архитектурные паттерны

Кодовая база следует принципам **Clean Architecture** (Uncle Bob) с чётким разделением ответственности:

1. **Domain-Driven Design**: Основная бизнес-логика изолирована в domain layer
2. **Dependency Inversion**: Все зависимости направлены внутрь к domain layer
3. **Repository Pattern**: Абстракция доступа к данным
4. **Factory Pattern**: Создание entities через функциональную фабрику
5. **Value Objects**: Неизменяемые объекты для Position, Size, Color, Font
6. **Aggregate Root**: Scene как агрегат, управляющий преобразованиями координат

## Организация слоёв

```text
src_clean_architecture/
├── domain/                  # Бизнес-логика (независима от фреймворков)
│   ├── aggregates/          # Агрегаты (Scene)
│   ├── entities/            # Доменные сущности (Entity, Rectangle, Ellipse, Text)
│   ├── value-objects/       # Value Objects (Position, Size, Color, Font)
│   ├── interfaces/          # Интерфейсы (IClonable, IEntityFactory)
│   └── kernel/              # Утилиты ядра (generateUUID)
├── use-cases/               # Прикладная логика
│   └── DrawEntityUseCase.ts
├── adapters/                # Адаптеры внешнего мира
│   ├── controllers/         # Контроллеры событий
│   ├── factories/           # Фабрика entities
│   ├── viewModels/          # Преобразование Entity → ViewModel для UI
│   └── dataModels/          # Преобразование Entity ↔ DataModel для storage
├── infrastructure/          # Внешние зависимости и реализации
│   ├── di/                  # Dependency Injection (Application)
│   ├── repositories/        # Реализации репозиториев (MobX/Redux)
│   └── ui/                  # UI компоненты (renderers, event handlers)
└── main.ts                  # Точка входа

```

### Правило зависимостей:

```
Infrastructure → Adapters → Use Cases → Domain
```

- **Domain** НЕ зависит ни от чего
- **Use Cases** зависят только от Domain
- **Adapters** зависят от Domain и Use Cases
- **Infrastructure** зависит от всех слоёв

## Domain Layer

Domain Layer содержит бизнес-логику приложения и независим от любых фреймворков.

### Entities

#### Entity (абстрактный базовый класс)

Базовый класс для всех рисуемых сущностей:

```typescript
abstract class Entity {
  static readonly type: string;
  id: string;
  position: ScenePosition;
  size: SceneSize;
  style: IEntityStyle;
  
  constructor(position: ScenePosition);
  getType(): string;
  static satisfies(entity: Entity): boolean;
  isPointInside(point: ScenePosition): boolean;
  clone(): this;
}
```

**Ключевые особенности:**

- `id` генерируется автоматически через `generateUUID()`
- `getType()` возвращает статический `type` класса
- `satisfies()` проверяет тип entity (type guard)
- `isPointInside()` реализует hit-testing
- `clone()` создаёт глубокую копию entity

#### Rectangle

```typescript
class Rectangle extends Entity {
  static override readonly type = "rectangle" as const;
}
```

Использует стандартный hit-testing из базового класса (AABB - Axis-Aligned Bounding Box).

#### Ellipse

```typescript
class Ellipse extends Entity {
  static override readonly type = "ellipse" as const;
  
  override isPointInside(point: ScenePosition): boolean {
    // Использует уравнение эллипса: ((x - cx) / rx)² + ((y - cy) / ry)² <= 1
  }
}
```

Переопределяет `isPointInside()` для точного hit-testing эллипса.

#### Text

```typescript
class Text extends Entity {
  static override readonly type = "text" as const;
  override style: ITextStyle;
  text: string;
  
  override clone(): this {
    // Копирует также text и font
  }
}
```

Расширяет стиль добавлением `font: Font`.

### Value Objects

Value Objects — это неизменяемые объекты, определяющиеся своими значениями.

#### Position

```typescript
abstract class Position {
  x: number;
  y: number;
}

class ClientPosition extends Position {}
class ScenePosition extends Position implements IClonable {}
```

- **ClientPosition**: Координаты в пикселях canvas (origin: top-left, Y вниз)
- **ScenePosition**: Координаты в мировом пространстве (origin: center, Y вверх)

#### Size

```typescript
abstract class Size {
  width: number;
  height: number;
}

class ClientSize extends Size {}
class SceneSize extends Size implements IClonable {}
```

- **ClientSize**: Размер в пикселях canvas
- **SceneSize**: Размер в мировых координатах

#### Color

```typescript
class Color implements IClonable {
  red: number;    // 0..1
  green: number;  // 0..1
  blue: number;   // 0..1
  alpha: number;  // 0..1
  
  toString(): string; // → "rgba(255, 255, 255, 1)"
  clone(): Color;
  
  static get Transparent(): Color;
  static get Black(): Color;
  static get White(): Color;
}
```

#### Font

```typescript
class Font implements IClonable {
  size: number;
  family: "Arial" | "Tahoma";
  
  toString(): string; // → "16px Arial"
  clone(): Font;
}
```

### Aggregates

#### Scene

Scene — это агрегат, управляющий viewport и преобразованиями координат:

```typescript
class Scene {
  zoom: number;
  origin: ScenePosition;
  size: ClientSize;
  
  constructor(size: ClientSize);
  
  // Преобразования координат
  toClientPosition(scenePosition: ScenePosition): ClientPosition;
  toScenePosition(clientPosition: ClientPosition): ScenePosition;
  toClientSize(sceneSize: SceneSize): ClientSize;
  toSceneSize(clientSize: ClientSize): SceneSize;
}
```

**Логика преобразований:**

```typescript
// Scene → Client
toClientPosition(scenePosition) {
  const x = scenePosition.x - this.origin.x;
  const y = scenePosition.y - this.origin.y;
  const position = new ClientPosition(
    x * this.zoom,
    y * -this.zoom  // Инверсия Y
  );
  position.x += this.size.width / 2;   // Смещение в центр
  position.y += this.size.height / 2;
  return position;
}

// Client → Scene
toScenePosition(clientPosition) {
  const x = clientPosition.x - this.size.width / 2;
  const y = clientPosition.y - this.size.height / 2;
  const position = new ScenePosition(
    x / this.zoom,
    y / -this.zoom  // Инверсия Y
  );
  position.x += this.origin.x;
  position.y += this.origin.y;
  return position;
}
```

### Interfaces

#### IEntityRepository

```typescript
interface IEntityRepository {
  // Queries
  readonly entities: Entity[];
  readonly drawingEntity: Entity | null;
  readonly tool: Tool;
  
  // Commands
  addEntity(entity: Entity): void;
  removeEntity(id: string): void;
  clearEntities(): void;
  setEntitySize(id: string, size: SceneSize): void;
  setDrawingEntity(entity: Entity | null): void;
  setTool(tool: Tool): void;
}

type Tool = "rectangle" | "ellipse" | "text";
```

#### ISceneRepository

```typescript
interface ISceneRepository {
  // Queries
  readonly scene: Scene;
  readonly zoom: number;
  readonly origin: ScenePosition;
  readonly size: ClientSize;
  
  // Commands
  setZoom(zoom: number): void;
  setOrigin(origin: ScenePosition): void;
  setSize(size: ClientSize): void;
}
```

#### IEntityFactory

```typescript
// Функциональный тип
type IEntityFactory = (type: string, position: ScenePosition) => Entity;
```

## Use Cases Layer

Use Cases содержат прикладную логику приложения.

### DrawEntityUseCase

Управляет процессом рисования новой фигуры:

```typescript
class DrawEntityUseCase {
  constructor(
    entityRepository: IEntityRepository,
    entityFactory: IEntityFactory
  );
  
  start(type: string, position: ScenePosition): void;
  update(size: SceneSize): void;
  finish(): void;
}
```

**Workflow:**

1. **start()**: Создаёт новую entity через factory, сохраняет в `drawingEntity`
2. **update()**: Обновляет размер рисуемой entity
3. **finish()**: Добавляет entity в список `entities`, очищает `drawingEntity`

## Adapters Layer

Adapters Layer адаптирует domain для внешнего мира.

### Controllers

#### MouseController

Обрабатывает события мыши и делегирует use cases:

```typescript
class MouseController {
  constructor(
    entityRepository: IEntityRepository,
    sceneRepository: ISceneRepository,
    drawEntityUseCase: DrawEntityUseCase
  );
  
  onMouseDown(event: MouseEvent): void;
  onMouseMove(event: MouseEvent): void;
  onMouseUp(): void;
  onContextMenu(event: MouseEvent): void;
}
```

**Логика:**

- **onMouseDown**: Преобразует client координаты → scene, вызывает `drawEntityUseCase.start()`
- **onMouseMove**: Вычисляет размер от точки старта, вызывает `drawEntityUseCase.update()`
- **onMouseUp**: Вызывает `drawEntityUseCase.finish()`

### Factories

#### entityFactory

Функциональная фабрика для создания entities:

```typescript
const entityFactory: IEntityFactory = (
  type: string, 
  position: ScenePosition
): Entity => {
  switch (type) {
    case Rectangle.type: return new Rectangle(position);
    case Ellipse.type: return new Ellipse(position);
    case Text.type: return new Text(position);
    default: throw new Error("Unknown Entity");
  }
};
```

### ViewModels

ViewModels преобразуют domain entities в объекты для рендеринга.

#### Entity ViewModels

```typescript
interface IEntityViewModel {
  readonly type: string;
  readonly x: number;        // client coordinates
  readonly y: number;        // client coordinates
  readonly width: number;
  readonly height: number;
  readonly fillStyle: string;
  readonly strokeStyle: string;
  readonly lineWidth: number;
}

interface ITextViewModel extends IEntityViewModel {
  readonly text: string;
  readonly font: string;
}

// Функция преобразования
function entityToViewModel(entity: Entity, scene: Scene): IEntityViewModel;
```

**Важно:** ViewModels содержат координаты в client space для прямого использования в canvas API.

#### Scene ViewModel

```typescript
interface ISceneViewModel {
  zoom: number;
  origin: ScenePosition;
  size: ClientSize;
}

function sceneToViewModel(scene: Scene): ISceneViewModel;
```

### DataModels

DataModels преобразуют entities в простые объекты для сохранения/передачи.

#### Entity DataModels

```typescript
interface IEntityDataModel {
  type: string;
  id: string;
  position: IPositionDataModel;
  size: ISizeDataModel;
  style: {
    border: { width: number; color: { red, green, blue, alpha } };
    fill: { color: { red, green, blue, alpha } };
  };
}

function entityToDataModel(entity: Entity): IEntityDataModel;
function dataModelToEntity(dataModel: IEntityDataModel): Entity;
```

DataModels используются в Redux repositories для сериализации state.

## Infrastructure Layer

Infrastructure Layer содержит реализации для внешних зависимостей.

### Repositories

Приложение поддерживает **две реализации** repositories: **MobX** и **Redux**.

#### MobX Implementation

**EntityRepositoryMobX:**

```typescript
class EntityRepositoryMobX implements IEntityRepository, IReactiveRepository {
  private _entities: Entity[] = [];
  private _drawingEntity: Entity | null = null;
  private _tool: Tool = Rectangle.type;
  
  constructor() {
    makeAutoObservable(this);
  }
  
  subscribe(listener: () => void): () => void {
    return reaction(() => toJS(this), listener, {
      equals: comparer.structural,
      fireImmediately: true,
    });
  }
}
```

**SceneRepositoryMobX:**

```typescript
class SceneRepositoryMobX implements ISceneRepository, IReactiveRepository {
  private _scene: Scene;
  
  constructor(size: ClientSize) {
    this._scene = new Scene(size);
    makeObservableAuto(this);
  }
  
  get scene() { return this._scene; }
  setZoom(zoom: number) { this._scene.zoom = zoom; }
  // ...
}
```

MobX repositories напрямую содержат domain entities и делают их observable.

#### Redux Implementation

**EntityRepositoryRedux:**

```typescript
class EntityRepositoryRedux implements IEntityRepository, IReactiveRepository {
  private store: IEntityStoreRedux;
  
  get entities(): Entity[] {
    return this.store.getState().entities.map(dataModelToEntity);
  }
  
  addEntity(entity: Entity): void {
    this.store.dispatch(entityActions.add(entityToDataModel(entity)));
  }
  
  subscribe(listener: () => void): () => void {
    return this.store.subscribe(listener);
  }
}
```

Redux repositories используют DataModels для хранения в Redux store и преобразуют их в entities при чтении.

### UI Layer

#### Renderers

Иерархия рендереров:

```
AbstractRenderer (базовый класс)
├── Renderer (главный оркестратор)
│   ├── EntitiesRenderer
│   │   ├── RectangleRenderer
│   │   ├── EllipseRenderer
│   │   └── TextRenderer
│   └── SceneRenderer
```

**AbstractRenderer:**

```typescript
abstract class AbstractRenderer {
  protected ctx: CanvasRenderingContext2D;
  abstract render(...args: unknown[]): void;
}
```

**Renderer:**

```typescript
class Renderer extends AbstractRenderer {
  constructor(
    ctx: CanvasRenderingContext2D,
    entitiesRenderer: EntitiesRenderer,
    sceneRenderer: SceneRenderer
  );
  
  render() {
    this.ctx.clearRect(...);
    this.sceneRenderer.render();
    this.entitiesRenderer.render();
  }
}
```

**EntitiesRenderer:**

```typescript
class EntitiesRenderer extends AbstractRenderer {
  constructor(
    ctx: CanvasRenderingContext2D,
    entityRepository: IEntityRepository,
    scene: Scene
  );
  
  render() {
    const entities = [
      ...this.entityRepository.entities,
      this.entityRepository.drawingEntity
    ].filter(e => !!e);
    
    entities.forEach(entity => {
      const viewModel = entityToViewModel(entity, this.scene);
      
      if (isRectangleViewModel(viewModel)) {
        this.rectangleRenderer.render(viewModel);
      }
      // ... другие типы
    });
  }
}
```

**SceneRenderer:**

```typescript
class SceneRenderer extends AbstractRenderer {
  constructor(ctx: CanvasRenderingContext2D, scene: Scene);
  
  render() {
    // Рисует оси координат через origin
    const clientOrigin = this.scene.toClientPosition(this.scene.origin);
    // Рисует горизонтальную и вертикальную линии
  }
}
```

#### Event Handlers

**CanvasEventHandler:**

```typescript
class CanvasEventHandler {
  constructor(
    $canvas: HTMLCanvasElement,
    mouseController: MouseController
  );
  
  subscribe(): () => void {
    const abortController = new AbortController();
    this.$canvas.addEventListener('mousedown', 
      this.mouseController.onMouseDown, 
      { signal: abortController.signal }
    );
    // ... другие события
    return () => abortController.abort();
  }
}
```

Использует `AbortController` для чистой отписки от событий.

### Dependency Injection

**Application:**

```typescript
class Application {
  private disposeBag: Array<() => void> = [];
  
  constructor() {
    // 1. Настройка canvas
    const ctx = canvas.getContext("2d");
    retinaFix(ctx, dpr);
    
    // 2. Создание repositories
    const entityRepository = new EntityRepositoryRedux(store);
    const sceneRepository = new SceneRepositoryRedux(size, store);
    
    // 3. Создание use cases
    const drawEntityUseCase = new DrawEntityUseCase(
      entityRepository,
      entityFactory
    );
    
    // 4. Создание controllers
    const mouseController = new MouseController(
      entityRepository,
      sceneRepository,
      drawEntityUseCase
    );
    
    // 5. Создание renderers
    const renderer = new Renderer(ctx, entitiesRenderer, sceneRenderer);
    
    // 6. Подписка на изменения
    this.disposeBag = [
      canvasEventHandler.subscribe(),
      entityRepository.subscribe(() => renderer.render()),
      sceneRepository.subscribe(() => renderer.render()),
    ];
  }
  
  dispose() {
    this.disposeBag.forEach(dispose => dispose());
  }
}
```

## Системы координат

Приложение использует две системы координат:

### Client Coordinates (Экранные)

- Origin: Верхний левый угол canvas
- Ось X: Направлена вправо
- Ось Y: Направлена вниз
- Единица: Пиксели

### Scene Coordinates (Мировые)

- Origin: Центр viewport
- Ось X: Направлена вправо
- Ось Y: Направлена вверх (математическая система)
- Единица: Абстрактные единицы

### Преобразования

Все преобразования инкапсулированы в `Scene` aggregate:

```typescript
// При рисовании
const clientPos = new ClientPosition(event.offsetX, event.offsetY);
const scenePos = scene.toScenePosition(clientPos);
entity.position = scenePos;

// При рендеринге
const clientPos = scene.toClientPosition(entity.position);
const clientSize = scene.toClientSize(entity.size);
ctx.fillRect(clientPos.x, clientPos.y, clientSize.width, clientSize.height);
```

## Поток данных

### Рисование фигуры (полный цикл)

```
1. User clicks on canvas
   ↓
2. MouseController.onMouseDown()
   - event.offsetX, event.offsetY (Client Coords)
   ↓
3. scene.toScenePosition(clientPosition)
   - Преобразование в Scene Coords
   ↓
4. drawEntityUseCase.start(tool, scenePosition)
   - entityFactory создаёт entity
   - entityRepository.setDrawingEntity(entity)
   ↓
5. Repository notifies subscribers
   ↓
6. Renderer.render()
   - EntitiesRenderer.render()
     - entityToViewModel(entity, scene)
       - Преобразование Scene Coords → Client Coords
     - rectangleRenderer.render(viewModel)
       - ctx.fillRect(x, y, width, height)

7. User moves mouse
   ↓
8. MouseController.onMouseMove()
   - Вычисляет размер
   ↓
9. drawEntityUseCase.update(sceneSize)
   - entityRepository.setEntitySize(id, size)
   ↓
10. Repository notifies → Renderer.render()

11. User releases mouse
    ↓
12. MouseController.onMouseUp()
    ↓
13. drawEntityUseCase.finish()
    - entityRepository.addEntity(drawingEntity)
    - entityRepository.setDrawingEntity(null)
    ↓
14. Repository notifies → Renderer.render()
```

## State Management

### Выбор между MobX и Redux

В приложении реализованы **обе** версии:

#### MobX (проще, меньше boilerplate)

```typescript
// В Application.ts
const entityRepository = new EntityRepositoryMobX();
const sceneRepository = new SceneRepositoryMobX(size);
```

**Преимущества:**
- Меньше кода
- Автоматическое отслеживание зависимостей
- Domain entities напрямую observable

**Недостатки:**
- Сложнее отладка
- "Магия" MobX может скрывать проблемы

#### Redux (более явный, предсказуемый)

```typescript
// В Application.ts
const entityRepository = new EntityRepositoryRedux(entityStoreAdapter);
const sceneRepository = new SceneRepositoryRedux(size, sceneStoreAdapter);
```

**Преимущества:**
- Явный поток данных
- Redux DevTools для отладки
- Сериализуемый state (легко сохранять/загружать)

**Недостатки:**
- Больше boilerplate кода
- Дополнительное преобразование Entity ↔ DataModel

### Reactive Pattern

Оба repository реализуют `IReactiveRepository`:

```typescript
interface IReactiveRepository {
  subscribe(listener: () => void): () => void;
}
```

Это позволяет renderer'ам автоматически обновляться при изменении данных:

```typescript
entityRepository.subscribe(() => renderer.render());
sceneRepository.subscribe(() => renderer.render());
```

## Rendering Pipeline

### Retina Display Support

```typescript
function retinaFix(ctx: CanvasRenderingContext2D, dpr: number) {
  const canvas = ctx.canvas;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  
  canvas.width = cssWidth * dpr;  // Physical pixels
  canvas.height = cssHeight * dpr;
  
  canvas.style.width = `${cssWidth}px`;   // CSS pixels
  canvas.style.height = `${cssHeight}px`;
  
  ctx.scale(dpr, dpr);  // Scale context
}
```

Это обеспечивает чёткий рендеринг на retina дисплеях.

### Coordinate System на Canvas

Canvas использует Client Coordinates, но `EntitiesRenderer` преобразует через ViewModels:

```typescript
// В entityToViewModel
const clientPosition = scene.toClientPosition(entity.position);
const clientSize = scene.toClientSize(entity.size);

return {
  x: clientPosition.x,
  y: clientPosition.y,
  width: clientSize.width,
  height: clientSize.height,
  // ...
};
```

Затем renderer просто использует эти координаты:

```typescript
ctx.fillRect(viewModel.x, viewModel.y, viewModel.width, viewModel.height);
```

## Добавление новых функций

### Добавление нового типа Entity

Пример: Добавление `Line`

#### 1. Создать entity в domain

```typescript
// src_clean_architecture/domain/entities/Line.ts
export class Line extends Entity {
  static override readonly type = "line" as const;
  
  // Дополнительные поля
  startPoint: ScenePosition;
  endPoint: ScenePosition;
  
  constructor(position: ScenePosition) {
    super(position);
    this.startPoint = position.clone();
    this.endPoint = position.clone();
  }
  
  override isPointInside(point: ScenePosition): boolean {
    // Реализация hit-testing для линии
    // (расстояние от точки до линии < threshold)
  }
  
  override clone(): this {
    const clone = super.clone() as this;
    clone.startPoint = this.startPoint.clone();
    clone.endPoint = this.endPoint.clone();
    return clone;
  }
}
```

#### 2. Обновить фабрику

```typescript
// src_clean_architecture/adapters/factories/EntityFactory.ts
export const entityFactory: IEntityFactory = (type, position) => {
  switch (type) {
    case Line.type: return new Line(position);
    // ... остальные cases
  }
};
```

#### 3. Обновить Tool type

```typescript
// src_clean_architecture/domain/interfaces/repositories/IEntityRepository.d.ts
export type Tool = 
  | typeof Rectangle.type 
  | typeof Ellipse.type 
  | typeof Text.type
  | typeof Line.type;  // Добавить
```

#### 4. Создать ViewModel

```typescript
// src_clean_architecture/adapters/viewModels/EntityViewModel.ts
export interface ILineViewModel extends IEntityViewModel {
  type: typeof Line.type;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

function lineToViewModel(line: Line, scene: Scene): ILineViewModel {
  const start = scene.toClientPosition(line.startPoint);
  const end = scene.toClientPosition(line.endPoint);
  
  return {
    ...entityBaseToViewModel(line, scene),
    type: Line.type,
    startX: start.x,
    startY: start.y,
    endX: end.x,
    endY: end.y,
  };
}

// Обновить entityToViewModel
export const entityToViewModel = (entity: Entity, scene: Scene) => {
  if (Line.satisfies(entity)) {
    return lineToViewModel(entity, scene);
  }
  // ... остальные типы
};
```

#### 5. Создать DataModel (для Redux)

```typescript
// src_clean_architecture/adapters/dataModels/EntityDataModel.ts
type ILineDataModel = ToPlainObject<Line> & {
  type: typeof Line.type;
};

function lineToDataModel(line: Line): ILineDataModel {
  return {
    ...entityBaseToDataModel(line),
    type: Line.type,
    startPoint: { x: line.startPoint.x, y: line.startPoint.y },
    endPoint: { x: line.endPoint.x, y: line.endPoint.y },
  };
}

// Обновить entityToDataModel
export function entityToDataModel(entity: Entity): IEntityDataModel {
  if (Line.satisfies(entity)) {
    return lineToDataModel(entity);
  }
  // ...
}

// Обновить dataModelToEntity
export function dataModelToEntity(dataModel: IEntityDataModel): Entity {
  // ...
  if (isLineDataModel(dataModel) && Line.satisfies(entity)) {
    (entity as Line).startPoint = new ScenePosition(
      dataModel.startPoint.x, 
      dataModel.startPoint.y
    );
    (entity as Line).endPoint = new ScenePosition(
      dataModel.endPoint.x, 
      dataModel.endPoint.y
    );
  }
  // ...
}
```

#### 6. Создать renderer

```typescript
// src_clean_architecture/infrastructure/ui/renderers/entities/entity/LineRenderer.ts
export class LineRenderer extends AbstractRenderer {
  render(viewModel: ILineViewModel) {
    this.ctx.save();
    this.ctx.strokeStyle = viewModel.strokeStyle;
    this.ctx.lineWidth = viewModel.lineWidth;
    
    this.ctx.beginPath();
    this.ctx.moveTo(viewModel.startX, viewModel.startY);
    this.ctx.lineTo(viewModel.endX, viewModel.endY);
    this.ctx.stroke();
    
    this.ctx.restore();
  }
}
```

#### 7. Подключить renderer к EntitiesRenderer

```typescript
// src_clean_architecture/infrastructure/ui/renderers/entities/EntitiesRenderer.ts
export class EntitiesRenderer extends AbstractRenderer {
  private lineRenderer: LineRenderer;
  
  constructor(...) {
    // ...
    this.lineRenderer = new LineRenderer(ctx);
  }
  
  render() {
    viewModels.forEach(viewModel => {
      if (isLineViewModel(viewModel)) {
        this.lineRenderer.render(viewModel);
      }
      // ... остальные типы
    });
  }
}
```

### Добавление нового Use Case

Пример: `SelectEntityUseCase`

#### 1. Создать use case

```typescript
// src_clean_architecture/use-cases/SelectEntityUseCase.ts
export class SelectEntityUseCase {
  constructor(
    private entityRepository: IEntityRepository,
    private sceneRepository: ISceneRepository
  ) {}
  
  selectAtPosition(clientPosition: ClientPosition): void {
    const scenePosition = this.sceneRepository.scene
      .toScenePosition(clientPosition);
    
    const entity = this.entityRepository.entities
      .find(e => e.isPointInside(scenePosition));
    
    if (entity) {
      // TODO: Добавить selectedEntity в IEntityRepository
      // this.entityRepository.setSelectedEntity(entity);
    }
  }
  
  clearSelection(): void {
    // this.entityRepository.setSelectedEntity(null);
  }
}
```

#### 2. Обновить интерфейс repository

```typescript
// src_clean_architecture/domain/interfaces/repositories/IEntityRepository.d.ts
export interface IEntityRepository {
  // ... существующие поля
  readonly selectedEntity: Entity | null;
  
  // ... существующие методы
  setSelectedEntity(entity: Entity | null): void;
}
```

#### 3. Реализовать в repositories

```typescript
// MobX
class EntityRepositoryMobX {
  private _selectedEntity: Entity | null = null;
  
  get selectedEntity() { return this._selectedEntity; }
  setSelectedEntity(entity: Entity | null) {
    this._selectedEntity = entity;
  }
}

// Redux
class EntityRepositoryRedux {
  get selectedEntity(): Entity | null {
    const dm = this.store.getState().selectedEntity;
    return dm ? dataModelToEntity(dm) : null;
  }
  
  setSelectedEntity(entity: Entity | null): void {
    this.store.dispatch(
      entityActions.setSelected(
        entity ? entityToDataModel(entity) : null
      )
    );
  }
}
```

#### 4. Подключить в Application

```typescript
// src_clean_architecture/infrastructure/di/Application.ts
constructor() {
  // ...
  const selectEntityUseCase = new SelectEntityUseCase(
    entityRepository,
    sceneRepository
  );
  
  const mouseController = new MouseController(
    entityRepository,
    sceneRepository,
    drawEntityUseCase,
    selectEntityUseCase  // Передать
  );
}
```

#### 5. Использовать в controller

```typescript
// src_clean_architecture/adapters/controllers/MouseController.ts
class MouseController {
  constructor(
    // ...
    private selectEntityUseCase: SelectEntityUseCase
  ) {}
  
  onMouseDown(event: MouseEvent) {
    if (this.entityRepository.tool === 'select') {
      const clientPos = new ClientPosition(event.offsetX, event.offsetY);
      this.selectEntityUseCase.selectAtPosition(clientPos);
    } else {
      // ... рисование
    }
  }
}
```

## Заключение

Архитектура приложения следует принципам Clean Architecture:

✅ **Независимость от фреймворков**: Domain layer не зависит от MobX/Redux  
✅ **Тестируемость**: Domain logic легко тестировать в изоляции  
✅ **Независимость от UI**: Domain не знает о Canvas API  
✅ **Независимость от БД**: Repository Pattern абстрагирует хранение  
✅ **Гибкость**: Легко заменить MobX на Redux или наоборот  

Ключевые паттерны:

- **Aggregates** (Scene) инкапсулируют сложную логику
- **Value Objects** (Position, Size, Color) обеспечивают типобезопасность
- **Repository Pattern** абстрагирует state management
- **Factory Pattern** централизует создание entities
- **Adapter Pattern** изолирует внешние зависимости
- **Dependency Injection** управляет зависимостями

Эта архитектура масштабируется для добавления:
- Новых типов entities (Circle, Polygon, Arrow)
- Новых use cases (Selection, Grouping, Layers)
- Новых адаптеров (WebSocket sync, File export)
- Новых UI (React, Vue, Angular поверх этой архитектуры)

