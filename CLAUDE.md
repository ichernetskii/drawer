# CLAUDE.md

Этот файл содержит руководство для Claude Code (claude.ai/code) при работе с кодом в этом репозитории.

## Обзор проекта

Приложение для рисования на canvas, позволяющее создавать и манипулировать геометрическими фигурами (прямоугольники, эллипсы) с функциями выделения, изменения размера, перемещения, масштабирования, панорамирования и привязки к сетке. Построено на TypeScript, Vite и MobX для управления состоянием.

## Команды разработки

```bash
# Development server с HMR
yarn dev

# Проверка типов без генерации файлов
yarn validate:ts

# Production build (проверка типов + сборка)
yarn prod

# Линтинг
yarn lint

# Проверка и исправление форматирования
yarn prettier       # проверка форматирования
yarn prettier:fix   # исправление форматирования
```

## Архитектура

### Основные паттерны

**MVC-подобная архитектура**: Кодовая база следует паттерну Model-View-Controller:

- **Model (Store)**: MobX observable stores в `src/store/` управляют состоянием приложения
- **View (Renderer)**: Логика рендеринга на canvas в `src/presentation/renderers/` (observers)
- **Controller**: Обработчики событий в `src/presentation/controllers/` и operations в `src/application/operations/`

**Entity System**: Иерархическая структура entity с полиморфным рендерингом:

```
Entity (abstract base)
├── Drawable (фигуры, создаваемые пользователем)
│   ├── Rectangle
│   └── Ellipse
├── Selection (UI overlays)
│   ├── SelectionBox
│   ├── SelectionPreview
│   └── SelectionHover
└── Grid (визуализация системы координат)
```

Каждый подкласс entity реализует свою логику hit-testing `isPointInside()` и имеет соответствующий renderer.

### Управление состоянием

**MobX Stores** (все в `src/store/`):

- `RootStore`: Центральный store, содержащий все sub-stores
- `DrawableStore`: Управляет фигурами, созданными пользователем, и состоянием рисования
- `SelectionStore`: Управляет состоянием выделения (box, preview, hover)
- `SceneStore`: Управляет viewport (zoom, pan, origin, tool, grid)
- `ClientStore`: Настройки клиента (DPI)
- `HistoryStore`: Управляет историей для undo/redo

**Персистентность состояния**: `DrawableStore` и `SceneStore` реализуют интерфейс `Storable` и автоматически сохраняют данные в localStorage с использованием debounced saves (1000ms). Состояние загружается при инициализации в `src/index.ts`.

### Системы координат

**Две системы координат**:

1. **Client coordinates**: Координаты браузера в пикселях (origin в верхнем левом углу)
2. **Scene coordinates**: Координаты мирового пространства (origin в центре, Y вверх)

Transform stack в `SceneRenderer.render()`:

```
1. translate(screenCenter)    // перемещение origin в центр
2. scale(zoom, -zoom)          // применение zoom и переворот Y-оси
3. translate(-origin)          // смещение к текущему viewport
```

Используйте `SceneStore.getSceneCoordinates(clientCoords, snap?)` для преобразования client → scene координат. Параметр `snap` включает привязку к сетке.

### Controllers и Operations

**Controllers** (`src/presentation/controllers/`): Обрабатывают сырые DOM события

- `MouseController`: События мыши (down, move, up, contextmenu)
- `KeyboardController`: Клавиатурные сокращения (Delete, стрелки, Cmd+A, Cmd+C/V/X, Cmd+Z/Shift+Z)
- `WheelController`: Масштабирование колесом мыши (с чувствительностью к touchpad)
- `ToolbarController`: Взаимодействие с UI для переключения инструмента/сетки

**Operations** (`src/application/operations/`): Инкапсулируют многошаговые пользовательские workflow

- `DrawingOperation`: Создание новых фигур (start → update → finish)
- `SelectionOperation`: Выделение, перемещение, resize, copy/paste, delete
- `NavigationOperation`: Zoom, pan

Каждый controller делегирует соответствующим operations. Controllers используют `AbortController` для очистки.

### Иерархия Renderer

```
SceneRenderer (оркестрирует рендеринг сцены)
└── EntityRenderer (диспетчеризует к type-specific renderers)
    ├── DrawableRenderer
    │   ├── RectangleRenderer
    │   └── EllipseRenderer
    ├── SelectionRenderer
    │   ├── SelectionBoxRenderer
    │   ├── SelectionPreviewRenderer
    │   └── SelectionHoverRenderer
    └── GridRenderer
```

Все renderers наследуются от абстрактного базового класса `Renderer`. `SceneRenderer` использует MobX `autorun()` для реактивного рендеринга.

### Clean Architecture и интеграция с MobX

**Важно**: Проект следует принципам Clean Architecture:

- **Domain layer** (`src/domain/entities/`) НЕ имеет зависимостей от MobX
- **Infrastructure layer** (`src/infrastructure/factories/`) интегрирует MobX с domain entities через factories
- Entities используют `protected` поля (не `private`) чтобы MobX мог к ним обращаться
- Все изменения состояния entity происходят через mutation методы (например, `setPosition()`, `setSize()`)
- Factories оборачивают entities с помощью `makeObservable`, делая поля observable, getters computed, и методы actions

**Пример интеграции MobX**:

```typescript
// Domain entity (без MobX)
export class Rectangle extends Drawable {
	protected _position: Position | null = null;

	get position() {
		return this._position;
	}
	setPosition(value: Position | null) {
		this._position = value;
	}
}

// Infrastructure factory (интеграция с MobX)
function makeDrawableObservable<T extends Drawable>(drawable: T): T {
	makeObservable<T, "_position" | "_size" | "_color" | "_borderWidth">(drawable, {
		_position: observable,
		position: computed,
		setPosition: action,
		// ...
	});
	return drawable;
}
```

### Регистрация Entity

**Добавление новых типов drawable**: При добавлении нового типа фигуры:

1. Создайте класс entity, наследующий `Drawable` в `src/domain/entities/drawable/` со статическим свойством `type`
2. Реализуйте `isPointInside(point: Position): boolean` для hit-testing
3. Добавьте case в `createDrawable()` factory в `src/infrastructure/factories/EntityFactory.ts`
4. Если у нового типа есть дополнительные поля, создайте специализированную factory функцию (например, `makeTextObservable`)
5. Создайте renderer, наследующий `Renderer` в `src/presentation/renderers/scene/entity/drawable/`
6. Добавьте логику рендеринга в `DrawableRenderer.render()`

Factory pattern обеспечивает корректную десериализацию из localStorage.

**Добавление полей в Entity подклассы**: Если новый drawable имеет дополнительные поля (например, `Text` с полями `text` и `fontSize`):

1. Добавьте `protected` поля, getters и setter методы в entity класс
2. Создайте специализированную factory функцию с полным набором MobX annotations для всех полей
3. Обновите `DrawableRepository` и `HistoryStore` для сериализации/десериализации новых полей

## Ключевые детали реализации

### Привязка к сетке (Grid Snapping)

- Шаг сетки `10` scene units (настраивается в `SceneStore.gridStep`)
- Множитель привязки `10x` при удержании Shift (для грубой настройки)
- Используйте `snapToGrid(value, step)` из `src/shared/utils/snap.ts`
- Все операции рисования/перемещения/изменения размера поддерживают привязку через параметр `snap` в `getSceneCoordinates()`

### Блокировка соотношения сторон (Aspect Ratio Lock)

- Удерживайте Shift во время рисования или изменения размера для сохранения соотношения сторон 1:1
- Реализовано в `DrawingOperation.update()` и `SelectionOperation.updateResize()`

### Z-Order и Hit Testing

- Порядок элементов в массиве drawables определяет Z-order (позднее = сверху)
- `DrawableStore.getDrawableAtPosition()` итерируется в обратном порядке для поиска самого верхнего drawable
- Каждый drawable использует геометрическое тестирование формы (не bounding box) для точного выделения

### Поддержка Retina дисплеев

- Утилита `retinaFix()` настраивает разрешение canvas для high-DPI дисплеев
- Размер буфера canvas масштабируется на DPR, в то время как CSS размер остается неизменным
- Предотвращает размытый рендеринг на retina дисплеях

### Управление состоянием с MobX

**Stores используют `makeAutoObservable`**:

```typescript
export class DrawableStore {
	private _drawables: Drawable[] = [];

	constructor(repository: DrawableRepository) {
		this.repository = repository;
		makeAutoObservable(this); // Автоматически делает все поля observable, методы actions
	}

	get drawables() {
		return this._drawables;
	}
	set drawables(value) {
		this._drawables = value;
	}
}
```

`makeAutoObservable` автоматически:

- Делает все поля observable
- Делает все getters computed
- Делает все методы actions

Это проще и лаконичнее, чем использование декораторов.

## Path Aliases

Проект использует alias `@/` для директории `src/` (настроено в `tsconfig.json` и `vite.config.ts`).

## Package Manager

Этот проект использует Yarn 4.10.3. Всегда используйте `yarn` вместо `npm`.
