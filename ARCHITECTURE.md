# Документация архитектуры

Этот документ описывает архитектуру приложения для рисования на canvas.

## Содержание

- [Обзор](#обзор)
- [Архитектурные паттерны](#архитектурные-паттерны)
- [Организация слоёв](#организация-слоёв)
- [Domain Layer](#domain-layer)
- [Application Layer](#application-layer)
- [Presentation Layer](#presentation-layer)
- [Infrastructure Layer](#infrastructure-layer)
- [Store Layer](#store-layer)
- [Управление состоянием с MobX](#управление-состоянием-с-mobx)
- [Системы координат](#системы-координат)
- [Entity System](#entity-system)
- [Rendering Pipeline](#rendering-pipeline)
- [Поток событий](#поток-событий)
- [Персистентность](#персистентность)
- [Добавление новых функций](#добавление-новых-функций)

## Обзор

Приложение — это инструмент для рисования на canvas, позволяющий пользователям создавать и манипулировать геометрическими фигурами (прямоугольники, эллипсы) с функциями выделения, изменения размера, перемещения, масштабирования, панорамирования и привязки к сетке.

**Технологический стек:**

- TypeScript
- Vite (инструмент сборки)
- MobX (управление состоянием)
- HTML5 Canvas API

## Архитектурные паттерны

Кодовая база следует принципам **Clean Architecture** с чётким разделением ответственности:

1. **Domain-Driven Design**: Основная бизнес-логика изолирована в domain layer
2. **Dependency Inversion**: Infrastructure зависит от domain абстракций, а не наоборот
3. **MVC Pattern**: Паттерн Model (Stores) - View (Renderers) - Controller для UI логики
4. **Factory Pattern**: Создание entity централизовано в factories
5. **Repository Pattern**: Персистентность данных абстрагирована за интерфейсами repository

## Организация слоёв

```text
src/
├── domain/              # Основная бизнес-логика (не зависит от фреймворков)
│   └── entities/        # Domain entities (Rectangle, Ellipse, Selection, Grid)
├── application/         # Use cases и operations
│   └── operations/      # Многошаговые пользовательские workflows
├── presentation/        # UI layer
│   ├── controllers/     # Обработчики событий
│   └── renderers/       # Рендеринг на Canvas
├── infrastructure/      # Внешние зависимости
│   ├── factories/       # Создание entity и интеграция с MobX
│   └── persistence/     # localStorage repositories
├── store/               # Управление состоянием MobX
└── shared/              # Утилиты и типы
```

### Ключевые принципы:

- **Domain layer** НЕ имеет зависимостей от MobX или какого-либо фреймворка
- **Infrastructure layer** интегрирует MobX с domain entities через factories
- **Presentation layer** наблюдает за MobX stores и выполняет рендеринг/обработку событий
- **Application layer** оркеструет domain operations

## Domain Layer

### Иерархия Entity

```text
Entity (абстрактный базовый класс)
├── Drawable (фигуры, создаваемые пользователем)
│   ├── Rectangle
│   └── Ellipse
├── Selection (UI overlays)
│   ├── SelectionBox
│   ├── SelectionPreview
│   └── SelectionHover
└── Grid (визуализация системы координат)
```

### Дизайн Entity

Все entities наследуются от базового класса `Entity`, который предоставляет:

```typescript
// Protected поля (НЕ private - требуется для MobX)
protected _position: Position | null
protected _size: Size | null
protected _color: string
protected _borderWidth: number

// Публичные getters
get position(): Position | null
get size(): Size | null
get color(): string
get borderWidth(): number

// Mutation методы (станут MobX actions в factory)
setPosition(value: Position | null): void
setSize(value: Size | null): void
setColor(value: string): void
setBorderWidth(value: number): void
moveBy(deltaX: number, deltaY: number): void
normalize(): void  // Обрабатывает отрицательные width/height
```

**Важно**:

- Поля должны быть `protected` (не `private`) чтобы MobX мог к ним обращаться
- Mutation методы инкапсулируют все изменения состояния
- НЕТ импортов MobX в domain layer - остаётся независимым от фреймворков

### Специализированные Entity

Каждый тип entity добавляет свои собственные поля:

**SelectionBox**: `_padding`, `_zoom` - для рендеринга контура выделения вокруг выделенных элементов

**SelectionHover**: `_drawable`, `_zoom` - отслеживает, над каким drawable находится курсор

**Grid**: `_gridStep`, `_zoom`, `_topLeft`, `_bottomRight` - для рендеринга линий сетки

**Drawable**: `id` (readonly, автогенерируется) - уникальный идентификатор для каждой фигуры

### Hit Testing

Каждый drawable реализует `isPointInside(point: Position): boolean` для точного геометрического hit-testing:

- **Rectangle**: Проверка axis-aligned bounding box
- **Ellipse**: Проверка по уравнению эллипса `(x/a)² + (y/b)² ≤ 1`

## Application Layer

### Operations

Operations инкапсулируют многошаговые пользовательские workflows:

**DrawingOperation** (`drawingOperation.ts`):

- `start(sceneCoordinates)` - Начать рисование новой фигуры
- `update(sceneCoordinates, shiftKey)` - Обновить размер при перетаскивании
- `finish()` - Зафиксировать фигуру в drawableStore

**SelectionOperation** (`selectionOperation.ts`):

- `copy()`, `cut()`, `paste()` - Операции с буфером обмена
- `deleteSelected()` - Удалить выделенные drawable
- `selectAll()` - Выделить все drawable
- `startMove()`, `updateMove()`, `endMove()` - Переместить выделенные элементы
- `startResize()`, `updateResize()`, `endResize()` - Изменить размер выделения
- Управление selection preview (прямоугольник перетаскивания для выделения)

**NavigationOperation** (`navigationOperation.ts`):

- `zoomAtClientCoordinates(coords, factor)` - Масштабирование в позиции курсора
- `pan(delta)` - Панорамирование viewport

## Presentation Layer

### Controllers

Controllers обрабатывают DOM события и делегируют operations:

**MouseController** (`mouseController.ts`):

- Обрабатывает: `mousedown`, `mousemove`, `mouseup`, `contextmenu`
- Делегирует: `DrawingOperation`, `SelectionOperation`
- State machine: Drawing → Moving → Resizing → Selection Preview

**KeyboardController** (`keyboardController.ts`):

- Обрабатывает: Delete, стрелки, Cmd+A, Cmd+C, Cmd+V, Cmd+X, Cmd+Z, Cmd+Shift+Z
- Делегирует: `SelectionOperation`, `HistoryStore`

**WheelController** (`wheelController.ts`):

- Обрабатывает: Колесо мыши / pinch на trackpad
- Чувствительность с учётом touchpad (обнаружение fine vs coarse delta)
- Делегирует: `NavigationOperation`

**ToolbarController** (`toolbarController.ts`):

- Обрабатывает: Выбор инструмента (Rectangle, Ellipse, Selection) и переключение сетки
- Обновляет: `SceneStore.tool`, `SceneStore.isGridVisible`

Все controllers реализуют:

- `init()` - Присоединить event listeners с `AbortController` для очистки
- `dispose()` - Удалить listeners (важно для HMR)

### Renderers

```text
SceneRenderer (оркестрирует всю сцену)
└── EntityRenderer (полиморфный диспетчер)
    ├── DrawableRenderer
    │   ├── RectangleRenderer
    │   └── EllipseRenderer
    ├── SelectionRenderer
    │   ├── SelectionBoxRenderer
    │   ├── SelectionPreviewRenderer
    │   └── SelectionHoverRenderer
    └── GridRenderer
```

**SceneRenderer** (`sceneRenderer.ts`):

- Использует MobX `autorun()` для реактивного рендеринга
- Обрабатывает настройку canvas, трансформацию координат и рендеринг entity
- Transform stack: `translate(center) → scale(zoom, -zoom) → translate(-origin)`

**EntityRenderer** (`entityRenderer.ts`):

- Полиморфный диспетчер на основе типа entity
- Направляет к соответствующему специализированному renderer

**Специализированные Renderers**:

- Каждый renderer наследуется от абстрактного базового класса `Renderer`
- Реализует `render(ctx, entity)` со специфичной логикой рисования

## Infrastructure Layer

### Entity Factories

**EntityFactory.ts** - Мост между чистыми domain entities и MobX:

```typescript
// Создаёт drawable и оборачивает в MobX
export function createDrawable(type: string): Drawable {
	let drawable: Drawable;
	switch (type) {
		case Rectangle.type:
			drawable = new Rectangle();
			break;
		case Ellipse.type:
			drawable = new Ellipse();
			break;
	}
	return makeDrawableObservable(drawable);
}

// Интеграция с MobX через makeObservable
function makeDrawableObservable<T extends Drawable>(drawable: T): T {
	makeObservable<T, "_position" | "_size" | "_color" | "_borderWidth">(drawable, {
		_position: observable,
		_size: observable,
		_color: observable,
		_borderWidth: observable,
		position: computed,
		size: computed,
		color: computed,
		borderWidth: computed,
		setPosition: action,
		setSize: action,
		setColor: action,
		setBorderWidth: action,
		moveBy: action,
		normalize: action,
	});
	return drawable;
}
```

**Ключевые моменты**:

- Entities создаются как простые объекты (без MobX в domain)
- Factory оборачивает их с помощью `makeObservable` для настройки MobX
- Protected поля → `observable`
- Getters → `computed`
- Mutation методы → `action`
- Требуется generic type annotation: `makeObservable<Type, "protectedFields">`

**Добавление новых типов drawable требует**:

1. Создать класс entity в `domain/entities/drawable/`
2. Добавить case в `createDrawable()` switch
3. Создать специализированную factory функцию, если добавлены новые поля
4. Добавить renderer в `presentation/renderers/`

### Persistence

**Repository Pattern** абстрагирует localStorage:

**DrawableRepository** (`DrawableRepository.ts`):

```typescript
interface DrawableData {
  type: string;
  position: { x: number; y: number } | null;
  size: { width: number; height: number } | null;
  color: string;
  borderWidth: number;
}

save(drawables: Drawable[]): void  // Сериализация в localStorage
load(): Drawable[]                 // Десериализация из localStorage
```

**SceneRepository** (`SceneRepository.ts`):

```typescript
interface SceneData {
  zoom: number;
  origin: Position;
  tool: string;
}

save(data: SceneData): void
load(): SceneData | null
```

## Store Layer

MobX stores управляют состоянием приложения, используя `makeAutoObservable`:

### RootStore (`rootStore.ts`)

Центральный store, содержащий все sub-stores:

```typescript
export class RootStore {
	drawableStore: DrawableStore;
	selectionStore: SelectionStore;
	sceneStore: SceneStore;
	clientStore: ClientStore;
	historyStore: HistoryStore;

	constructor() {
		// Инициализация всех stores
		// Настройка MobX reactions (например, изменения zoom → обновление selection hover)
	}
}
```

### DrawableStore (`drawableStore.ts`)

Управляет фигурами, созданными пользователем:

```typescript
class DrawableStore {
	private _drawables: Drawable[] = [];
	private _drawing: Drawable | null = null;

	constructor(repository: DrawableRepository) {
		makeAutoObservable(this); // Все поля → observable, методы → action
	}

	getDrawableAtPosition(position: Position): Drawable | null;
	getDrawablesInRectangle(rectangle): Drawable[];
	save(); // Debounced сохранение в localStorage (1000ms)
	load(); // Загрузка из localStorage
}
```

### SelectionStore (`selectionStore.ts`)

Управляет состоянием выделения (сложный store с операциями resize/move):

```typescript
class SelectionStore {
	private _drawables: Drawable[] = []; // Выделенные элементы
	private _selectionPreview: SelectionPreview | null;
	private _selectionHover: SelectionHover;
	private _clipboard: Drawable[] = [];

	// Состояние resize
	private _resizeHandle: ResizeHandle | null;
	private _resizeStartBox: ResizeStartBox | null;
	private _resizeStartSnapshots: DrawableSnapshot[];

	// Состояние move
	private _isMoving: boolean;
	private _moveStartSnapshots: DrawableSnapshot[];

	constructor() {
		makeAutoObservable(this);
	}

	get selectionBox(): SelectionBox | null; // Computed box вокруг выделенных элементов

	startResize(handle, cursor);
	updateResize(cursor, shiftKey, gridStep); // Сохраняет aspect ratio при shift
	endResize();

	startMove(startPosition);
	updateMove(currentPosition);
	endMove();
}
```

### SceneStore (`sceneStore.ts`)

Управляет состоянием viewport:

```typescript
class SceneStore {
	private _size: Size = { width: 0, height: 0 };
	private _zoom: number = 1;
	private _origin: Position = { x: 0, y: 0 };
	private _tool: string = SelectionPreview.type;
	private _isGridVisible: boolean = true;

	constructor(repository: SceneRepository) {
		makeAutoObservable(this);
	}

	get grid(): Grid; // Computed сетка на основе текущего viewport

	getSceneCoordinates(clientCoords, snap): Position; // Client → Scene трансформация
	zoomAtSceneCoordinates(sceneCoords, factor);
	moveOriginBy(delta);

	save(); // Debounced save (1000ms)
	load();
}
```

### HistoryStore (`historyStore.ts`)

Функциональность undo/redo:

```typescript
class HistoryStore {
	private _history: Snapshot[] = [];
	private _index: number = -1;

	push(drawables: Drawable[]); // Сохранить snapshot
	undo(): Drawable[] | undefined;
	redo(): Drawable[] | undefined;
}
```

### ClientStore (`clientStore.ts`)

Настройки клиента:

```typescript
class ClientStore {
	get dpr(): number; // Device pixel ratio для retina дисплеев
}
```

## Управление состоянием с MobX

### Миграция от декораторов к `makeAutoObservable`

Кодовая база использует `makeAutoObservable(this)` вместо декораторов для простоты:

**До** (декораторы):

```typescript
class Store {
	@observable private accessor _value = 0;

	@computed get value() {
		return this._value;
	}
	@action set value(v) {
		this._value = v;
	}
}
```

**После** (`makeAutoObservable`):

```typescript
class Store {
	private _value = 0;

	constructor() {
		makeAutoObservable(this); // Автоматически делает поля observable, getters computed, методы actions
	}

	get value() {
		return this._value;
	}
	set value(v) {
		this._value = v;
	}
}
```

### Domain Entities vs Stores

**Domain entities** используют ручной `makeObservable` с явными аннотациями (в factories) потому что:

- Разные типы entity имеют разные поля
- Нужен точный контроль над тем, какие поля observable
- Entities создаются вне своего класса (в factories)

**Stores** используют `makeAutoObservable` потому что:

- Каждый store - это один класс с известными полями
- Проще и менее многословно
- Constructor - естественное место для настройки MobX

## Системы координат

Приложение использует две системы координат:

### 1. Client Coordinates

- Координаты браузера в пикселях
- Origin: Верхний левый угол canvas
- Ось Y: Направлена вниз

### 2. Scene Coordinates

- Координаты мирового пространства
- Origin: Центр viewport
- Ось Y: Направлена вверх (инвертирована от client)

### Трансформация координат

**SceneRenderer** применяет этот transform stack:

```javascript
ctx.translate(screenCenterX, screenCenterY); // Переместить origin в центр
ctx.scale(zoom, -zoom); // Применить zoom, перевернуть Y-ось
ctx.translate(-origin.x, -origin.y); // Смещение к текущей позиции viewport
```

**SceneStore.getSceneCoordinates()** выполняет обратную трансформацию:

```typescript
getSceneCoordinates(clientCoordinates: Position, snap = false): Position {
  const centerX = clientCoordinates.x - this.size.width / 2;
  const centerY = clientCoordinates.y - this.size.height / 2;
  let sceneX = centerX / this.zoom + this.origin.x;
  let sceneY = -centerY / this.zoom + this.origin.y;  // Обратите внимание на знак минус

  if (snap) {
    sceneX = snapToGrid(sceneX, this.gridStep);
    sceneY = snapToGrid(sceneY, this.gridStep);
  }

  return { x: sceneX, y: sceneY };
}
```

## Entity System

### Жизненный цикл Entity

1. **Создание**: `createDrawable(type)` → Factory создаёт entity → оборачивает в MobX
2. **Изменение**: Только через mutation методы (`setPosition`, `setSize`, и т.д.)
3. **Сериализация**: `toJS()` извлекает простой объект → сохраняется в localStorage/history
4. **Десериализация**: Repository загружает простые данные → Factory пересоздаёт entity с MobX

### Стратегия интеграции MobX

**Проблема**: Domain entities должны быть независимыми от фреймворков, но должны быть observable.

**Решение**: Factory pattern разделяет ответственность:

- **Domain entities** (`src/domain/entities/`) - простые TypeScript классы без MobX
- **Entity factories** (`src/infrastructure/factories/`) оборачивают entities с помощью `makeObservable`

**Почему `protected` вместо `private`?**

MobX нужен прямой доступ к полям, поэтому они должны быть `protected`:

```typescript
// В классе Entity
protected _position: Position | null = null;  // MobX может обратиться
private _position: Position | null = null;    // ❌ MobX не может обратиться
```

### Добавление новых полей в подклассы Entity

**Пример**: Добавление drawable `Text` с полями `text` и `fontSize`:

1. **Создать класс entity**:

```typescript
// src/domain/entities/drawable/Text.ts
export class Text extends Drawable {
	static readonly type = "text";

	protected _text: string = "";
	protected _fontSize: number = 16;

	get text() {
		return this._text;
	}
	get fontSize() {
		return this._fontSize;
	}

	setText(value: string) {
		this._text = value;
	}
	setFontSize(value: number) {
		this._fontSize = value;
	}

	override isPointInside(point: Position): boolean {
		// Логика hit-testing для текста
	}
}
```

2. **Обновить factory**:

```typescript
// src/infrastructure/factories/EntityFactory.ts
export function createDrawable(type: string): Drawable {
	switch (type) {
		case Text.type:
			return makeTextObservable(new Text());
		// ... другие cases
	}
}

function makeTextObservable(text: Text): Text {
	makeObservable<Text, "_position" | "_size" | "_color" | "_borderWidth" | "_text" | "_fontSize">(text, {
		// Базовые поля
		_position: observable,
		_size: observable,
		_color: observable,
		_borderWidth: observable,
		position: computed,
		size: computed,
		color: computed,
		borderWidth: computed,
		setPosition: action,
		setSize: action,
		setColor: action,
		setBorderWidth: action,
		moveBy: action,
		normalize: action,

		// Text-специфичные поля
		_text: observable,
		_fontSize: observable,
		text: computed,
		fontSize: computed,
		setText: action,
		setFontSize: action,
	});
	return text;
}
```

3. **Обновить repositories** для сериализации/десериализации новых полей
4. **Создать renderer** для нового типа drawable

## Rendering Pipeline

### Реактивный рендеринг с MobX

```typescript
// SceneRenderer.ts
render() {
  this.dispose();  // Очистить предыдущий autorun

  this.dispose = autorun(() => {
    // MobX отслеживает все обращения к observable здесь
    // Автоматически перезапускается при изменении любого наблюдаемого значения

    this.setupCanvas();
    this.applyTransform();

    // Рендерить сетку
    if (this.sceneStore.isGridVisible) {
      this.entityRenderer.render(this.ctx, this.sceneStore.grid);
    }

    // Рендерить все drawables
    for (const drawable of this.drawableStore.drawables) {
      this.entityRenderer.render(this.ctx, drawable);
    }

    // Рендерить UI overlays (selection box, preview, hover, drawing)
    // ...
  });
}
```

**Что вызывает ре-рендер?**

- Любое изменение `sceneStore.zoom`, `sceneStore.origin`, `sceneStore.size`
- Любое изменение массива `drawableStore.drawables` или свойств отдельных drawable
- Любое изменение `selectionStore.selectionBox`, `selectionStore.selectionPreview`, и т.д.
- Изменения `sceneStore.isGridVisible`

### Поддержка Retina дисплеев

```typescript
// утилита retinaFix
export function retinaFix(canvas: HTMLCanvasElement, dpr: number) {
	const cssWidth = canvas.clientWidth;
	const cssHeight = canvas.clientHeight;

	canvas.width = cssWidth * dpr; // Размер буфера масштабируется на DPR
	canvas.height = cssHeight * dpr;

	// CSS размер остаётся прежним (без визуального масштабирования)
	canvas.style.width = `${cssWidth}px`;
	canvas.style.height = `${cssHeight}px`;
}
```

Это предотвращает размытый рендеринг на high-DPI дисплеях, рендеря в больший буфер.

## Поток событий

### Пример: Рисование прямоугольника

1. **Пользователь кликает на canvas** → `MouseController.handleMouseDown()`
2. **Проверка текущего инструмента** → Если инструмент `Rectangle.type`:
    - Преобразовать client координаты → scene координаты (с привязкой к сетке)
    - Вызвать `DrawingOperation.start(sceneCoordinates)`
3. **DrawingOperation.start()**:
    - Создать новый Rectangle через `createDrawable(Rectangle.type)`
    - Установить position в точку клика
    - Сохранить в `drawableStore.drawing`
    - Сохранить позицию нажатия мыши в `sceneStore.mouseDown`
4. **Пользователь двигает мышь** → `MouseController.handleMouseMove()`
    - Преобразовать координаты → scene координаты
    - Вызвать `DrawingOperation.update(sceneCoordinates, shiftKey)`
5. **DrawingOperation.update()**:
    - Вычислить width/height от начала до текущей позиции
    - Если клавиша Shift: сохранить соотношение сторон 1:1
    - Обновить `drawing.size` через `setSize()`
    - Вызвать `drawing.normalize()` для обработки отрицательных размеров
6. **MobX реагирует** → `SceneRenderer.autorun()` обнаруживает изменение → ре-рендер canvas
7. **Пользователь отпускает мышь** → `MouseController.handleMouseUp()`
    - Вызвать `DrawingOperation.finish()`
8. **DrawingOperation.finish()**:
    - Добавить `drawing` в массив `drawableStore.drawables`
    - Очистить `drawableStore.drawing`
    - Очистить `sceneStore.mouseDown`
    - Отправить в историю: `historyStore.push(drawableStore.drawables)`
    - Вызвать сохранение: `drawableStore.save()` (debounced 1000ms)

### Пример: Изменение размера выделения

1. **У пользователя выделены элементы** → `selectionStore.drawables.length > 0`
2. **SelectionStore вычисляет selectionBox** (через computed getter)
3. **Пользователь наводит на край** → `MouseController.handleMouseMove()`
    - `selectionStore.getPositionOnEdgeOfSelection()` возвращает handle (например, "top-right")
    - `selectionStore.getCursor()` возвращает resize курсор (например, "nesw-resize")
4. **Пользователь кликает на край** → `MouseController.handleMouseDown()`
    - Вызвать `SelectionOperation.startResize(handle, cursor)`
5. **SelectionOperation.startResize()**:
    - `selectionStore.startResize(handle, cursor)`:
        - Зафиксировать текущие границы selection box
        - Сделать snapshot всех выделенных drawables (position, size)
        - Вычислить grab offset (чтобы предотвратить скачок курсора)
6. **Пользователь перетаскивает** → `MouseController.handleMouseMove()`
    - Вызвать `SelectionOperation.updateResize(cursor, shiftKey)`
7. **SelectionOperation.updateResize()**:
    - `selectionStore.updateResize(cursor, shiftKey, gridStep)`:
        - Вычислить scale факторы от начального box + текущего курсора
        - Если Shift: сохранить aspect ratio, используя максимальное отклонение scale
        - Для каждого snapshot: масштабировать position/size относительно anchor point
        - Привязать к сетке
        - Обновить drawable через `setPosition()` / `setSize()`
8. **MobX реагирует** → Ре-рендер с обновлёнными позициями/размерами
9. **Пользователь отпускает** → `MouseController.handleMouseUp()`
    - Вызвать `SelectionOperation.endResize()`
    - `selectionStore.endResize()` очищает состояние resize
    - `historyStore.push()` сохраняет snapshot
    - `drawableStore.save()` сохраняет в localStorage

## Персистентность

### Стратегия авто-сохранения

Как `DrawableStore`, так и `SceneStore` реализуют интерфейс `Storable`:

```typescript
interface Storable {
	save(): void;
	load(): void;
}
```

**Debounced saves** (задержка 1000ms):

```typescript
save = debounce(() => {
	this.repository.save(this.drawables);
}, 1000);
```

Это предотвращает избыточные записи в localStorage во время быстрых изменений (например, перетаскивания).

### Поток инициализации

```typescript
// src/index.ts
const rootStore = new RootStore();

rootStore.drawableStore.load(); // Загрузить сохранённые рисунки
rootStore.sceneStore.load(); // Загрузить состояние viewport (zoom, origin, tool)
rootStore.historyStore.push(rootStore.drawableStore.drawables); // Начальный history snapshot
```

### Структура данных

**localStorage["drawableStore"]**:

```json
{
	"drawables": [
		{
			"type": "rectangle",
			"position": { "x": 100, "y": 50 },
			"size": { "width": 200, "height": 150 },
			"color": "#fff",
			"borderWidth": 10
		}
	]
}
```

**localStorage["sceneStore"]**:

```json
{
	"zoom": 1.5,
	"origin": { "x": 0, "y": 0 },
	"tool": "rectangle"
}
```

## Добавление новых функций

### Добавление нового типа Drawable

**Пример**: Добавление drawable `Circle`

1. **Создать класс entity**:

```typescript
// src/domain/entities/drawable/Circle.ts
export class Circle extends Drawable {
	static readonly type = "circle";

	override isPointInside(point: Position): boolean {
		if (!this.position || !this.size) return false;

		const centerX = this.position.x + this.size.width / 2;
		const centerY = this.position.y + this.size.height / 2;
		const radiusX = this.size.width / 2;
		const radiusY = this.size.height / 2;

		const dx = (point.x - centerX) / radiusX;
		const dy = (point.y - centerY) / radiusY;

		return dx * dx + dy * dy <= 1;
	}
}
```

2. **Обновить factory**:

```typescript
// src/infrastructure/factories/EntityFactory.ts
export function createDrawable(type: string): Drawable {
	switch (type) {
		case Circle.type:
			drawable = new Circle();
			break;
		// ... другие cases
	}
	return makeDrawableObservable(drawable);
}
```

3. **Создать renderer**:

```typescript
// src/presentation/renderers/scene/entity/drawable/circle/circleRenderer.ts
export class CircleRenderer extends Renderer {
	render(ctx: CanvasRenderingContext2D, circle: Circle) {
		if (!circle.position || !circle.size) return;

		const centerX = circle.position.x + circle.size.width / 2;
		const centerY = circle.position.y + circle.size.height / 2;
		const radiusX = circle.size.width / 2;
		const radiusY = circle.size.height / 2;

		ctx.save();
		ctx.beginPath();
		ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
		ctx.fillStyle = circle.color;
		ctx.fill();
		ctx.strokeStyle = circle.color;
		ctx.lineWidth = circle.borderWidth;
		ctx.stroke();
		ctx.restore();
	}
}
```

4. **Обновить DrawableRenderer**:

```typescript
// src/presentation/renderers/scene/entity/drawable/drawableRenderer.ts
render(ctx: CanvasRenderingContext2D, entity: Entity) {
  if (isCircle(entity)) {
    this.circleRenderer.render(ctx, entity);
  }
  // ... другие типы drawable
}
```

5. **Добавить в toolbar** (HTML + CSS для кнопки инструмента)

### Добавление новой Operation

**Пример**: Добавление операции "Duplicate"

1. **Добавить метод в SelectionOperation**:

```typescript
// src/application/operations/selectionOperation.ts
duplicate() {
  if (this.rootStore.selectionStore.drawables.length === 0) return;

  const offset = 20;  // Немного сместить дубликаты
  const duplicates = this.rootStore.selectionStore.drawables.map(drawable => {
    const copy = cloneDrawable(drawable);
    if (copy.position) {
      copy.setPosition({
        x: copy.position.x + offset,
        y: copy.position.y + offset,
      });
    }
    return copy;
  });

  duplicates.forEach(d => this.rootStore.drawableStore.addDrawable(d));
  this.rootStore.selectionStore.drawables = duplicates;
  this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
  this.rootStore.drawableStore.save();
}
```

2. **Добавить клавиатурное сокращение**:

```typescript
// src/presentation/controllers/keyboardController.ts
handleKeyDown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'd') {
    event.preventDefault();
    this.selectionOperation.duplicate();
  }
  // ... другие сокращения
}
```

### Добавление нового Store

**Пример**: Добавление `ToolSettingsStore` для настроек инструментов

1. **Создать store**:

```typescript
// src/store/toolSettingsStore/toolSettingsStore.ts
export class ToolSettingsStore {
	private _strokeWidth: number = 2;
	private _fillColor: string = "#ffffff";

	constructor() {
		makeAutoObservable(this);
	}

	get strokeWidth() {
		return this._strokeWidth;
	}
	set strokeWidth(value: number) {
		this._strokeWidth = value;
	}

	get fillColor() {
		return this._fillColor;
	}
	set fillColor(value: string) {
		this._fillColor = value;
	}
}
```

2. **Добавить в RootStore**:

```typescript
// src/store/rootStore.ts
export class RootStore {
	// ... существующие stores
	toolSettingsStore: ToolSettingsStore;

	constructor() {
		// ... инициализация других stores
		this.toolSettingsStore = new ToolSettingsStore();
	}
}
```

3. **Использовать в operations**:

```typescript
// src/application/operations/drawingOperation.ts
start(sceneCoordinates: Position) {
  const entity = createDrawable(this.rootStore.sceneStore.tool);
  entity.setPosition(sceneCoordinates);
  entity.setColor(this.rootStore.toolSettingsStore.fillColor);  // Использование настроек
  entity.setBorderWidth(this.rootStore.toolSettingsStore.strokeWidth);
  // ...
}
```

---

## Резюме

Эта архитектура достигает:

✅ **Clean Architecture**: Domain логика изолирована от фреймворков
✅ **Тестируемость**: Чистая domain логика может тестироваться без MobX или UI
✅ **Расширяемость**: Легко добавлять новые фигуры, operations или stores
✅ **Реактивность**: MobX автоматически ре-рендерит при изменении состояния
✅ **Персистентность**: Автоматическое сохранение/загрузка с localStorage
✅ **Типобезопасность**: Полное покрытие TypeScript в строгом режиме

Ключевые архитектурные решения:

- **Factory pattern** связывает чистые domain entities с MobX observability
- **Protected поля** позволяют MobX обращаться к полям, сохраняя инкапсуляцию
- **Mutation методы** обеспечивают контролируемые изменения состояния и MobX actions
- **Repository pattern** абстрагирует persistence layer
- **MVC pattern** разделяет ответственность в presentation layer
- **makeAutoObservable** упрощает определения store
