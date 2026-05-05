# .clinerules — Flutter App

## Project overview
- App name: [your app name]
- Platform targets: [iOS / Android / Web / Desktop]
- Flutter version: 3.x (Dart 3.x)
- Min SDK: Android 21 / iOS 14
- Design system: Material 3 (Material You)
- State management: [Riverpod / BLoC / Provider / GetX]
- Architecture: Feature-first Clean Architecture

---

## 1. Architecture rules

### Folder structure (feature-first)
lib/
├── core/
│   ├── constants/         # AppColors, AppSizes, AppStrings
│   ├── theme/             # AppTheme, AppTextStyles
│   ├── router/            # GoRouter config
│   ├── utils/             # helpers, extensions
│   └── widgets/           # shared reusable widgets
├── features/
│   └── [feature_name]/
│       ├── data/
│       │   ├── models/    # data classes + fromJson/toJson
│       │   ├── sources/   # remote + local data sources
│       │   └── repos/     # repository implementations
│       ├── domain/
│       │   ├── entities/  # pure Dart classes, no Flutter imports
│       │   ├── repos/     # abstract repository interfaces
│       │   └── usecases/  # single-responsibility use cases
│       └── presentation/
│           ├── screens/   # full screen widgets
│           ├── widgets/   # feature-specific widgets
│           └── providers/ # Riverpod providers / BLoC
└── main.dart

### Layer rules
- Domain layer: zero Flutter dependencies. Pure Dart only.
- Data layer: implements domain interfaces. Never import presentation.
- Presentation layer: only calls use cases or providers. No direct API calls.
- Every feature is self-contained. Cross-feature = go through core/.
- Use dependency injection (get_it + injectable) for all services.

### Navigation
- Use GoRouter for all navigation. No direct Navigator.push calls.
- Define all routes in core/router/app_router.dart.
- Use named routes only — never anonymous routes.
- Pass only IDs between routes, never full objects.

---

## 2. UI / design rules

### Material 3 (Material You)
- Always use Material 3. Never use M2 widgets.
- Use ColorScheme.fromSeed() for theming. Never hardcode colors.
- Use Theme.of(context).colorScheme.* for all colors.
- Use Theme.of(context).textTheme.* for all text styles.
- Support both light and dark mode in every widget.

### Design tokens (define in core/constants/app_sizes.dart)
- Base unit: 4.0
- Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- Border radius: 4 (small), 8 (default), 12 (card), 16 (large), 28 (pill)
- Elevation: 0, 1, 2, 4, 8 (use sparingly — prefer 0 or 1)
- Icon size: 16 (sm), 20 (md), 24 (default), 32 (lg)

### Widget rules
- Prefer const constructors everywhere possible.
- Every widget file = one widget class. No multi-widget files.
- Max widget build() method: 60 lines. Extract sub-widgets if longer.
- Never put business logic inside build(). Logic belongs in providers/BLoC.
- Use SizedBox for spacing, never Padding(padding: EdgeInsets.only(top:...)).
- Use SizedBox.shrink() instead of Container() for empty widgets.
- Prefer Column/Row over Stack unless layering is truly needed.
- Always use SafeArea on full-screen widgets.

### Responsive design
- Use LayoutBuilder or MediaQuery for responsive layouts.
- Breakpoints: mobile <600, tablet 600-1200, desktop >1200.
- Never hardcode pixel widths for layouts — use flex + constraints.
- Text must scale: use textScaleFactor-aware widgets.
- All tap targets: minimum 48x48 logical pixels (Material guideline).

### Typography
- Define all text styles in core/theme/app_text_styles.dart.
- Never use raw TextStyle() inline in widgets.
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold) only.
- Never hardcode font size directly — always use theme text styles.

### Images & assets
- Use cached_network_image for all network images. Never Image.network().
- Always provide a placeholder and error widget for cached images.
- SVG assets: use flutter_svg. Never rasterize SVGs.
- Asset naming: snake_case (user_avatar_placeholder.png).
- 1x, 2x, 3x variants for all raster assets.

---

## 3. State management rules (Riverpod)

- Use @riverpod code generation for all providers.
- AsyncNotifierProvider for async state (API calls, streams).
- NotifierProvider for sync state (UI state, forms).
- Provider for computed/derived values.
- Never use StateProvider for complex state — use Notifier instead.
- Always handle loading, data, and error states in UI.
- Use ref.invalidate() to refresh. Never manually set loading → data.
- Keep providers in the same feature folder as their consumers.
- Never expose mutable state directly — expose methods.

### Error handling
- Use Either (dartz) for all repository return types.
- Define typed Failure classes in domain/entities/failures.dart.
- Never throw exceptions from repositories — return failures.
- In providers: map failures to user-friendly error messages.
- Always log errors with a logger (talker / logger package).

---

## 4. Code style rules

### Naming
- Classes: PascalCase (UserProfileScreen, AuthRepository)
- Variables/methods: camelCase (isLoading, fetchUser)
- Constants: lowerCamelCase in const (appPrimaryColor, kDefaultPadding)
- Files: snake_case (user_profile_screen.dart)
- Private members: _prefixed (_controller, _handleTap)
- Providers: end in Provider (userProfileProvider, authStateProvider)
- BLoC: end in Bloc/Cubit (AuthBloc, ProfileCubit)
- Events: past tense (AuthLoginRequested, ProfileLoaded)
- States: describe the state (AuthInitial, AuthLoading, AuthSuccess)

### Dart rules
- Dart 3: use records, patterns, sealed classes where appropriate.
- Always use final for variables that don't change.
- Prefer const over final for compile-time constants.
- Use late sparingly — prefer nullable or required initialization.
- Never use dynamic — use generics or sealed classes.
- Use cascade (..) for chaining operations on the same object.
- Prefer named parameters for any function with 2+ parameters.
- Always add required keyword for non-nullable named parameters.
- Use extension methods instead of utility functions where idiomatic.

### Widget structure (standard order)
1. Constructor + const
2. Keys
3. Final fields (passed via constructor)
4. @override Widget build(BuildContext context)
5. Private methods (_handleTap, _buildHeader)

### Async rules
- Always await Futures. Never fire-and-forget unless intentional.
- Use try/catch in data layer only. Not in UI or domain.
- Cancel StreamSubscriptions in dispose().
- Never use FutureBuilder/StreamBuilder — use Riverpod or BLoC instead.

---

## 5. Performance rules

- const widgets everywhere possible — rebuild performance depends on it.
- Use RepaintBoundary to isolate expensive subtrees.
- ListView.builder for any list with more than 10 items — never ListView with children.
- Use AutomaticKeepAliveClientMixin for tabs that should retain state.
- Avoid building widgets inside build() — extract them as final fields.
- Avoid rebuilding parent to change child — use providers at the right scope.
- Images: always specify width/height to avoid layout shifts.
- Avoid opacity animations — use FadeTransition (uses layer, no repaint).
- Profile with Flutter DevTools before optimizing — no premature optimization.
- Never call setState() inside build() or from a Future that may outlive the widget.

---

## 6. Testing rules

### Structure
test/
├── unit/          # domain usecases, data models, utils
├── widget/        # individual widget tests
└── integration/   # full flow tests (integration_test/)

### Rules
- Every use case must have a unit test.
- Every repository must have a unit test with mocked data source.
- Widget tests for all custom widgets in core/widgets/.
- Use mocktail for mocking (not mockito).
- Use flutter_test for widget tests.
- Test file naming: [filename]_test.dart mirroring source structure.
- Aim for: 80%+ coverage on domain + data layers.
- Test all 3 states: loading, success, error.

---

## 7. Workflow rules

### Before writing any code
1. State your plan: what files will you create/modify and why.
2. Identify the layer: is this domain, data, or presentation?
3. Check if a similar widget/util already exists in core/.

### When building a screen
1. Create the route in app_router.dart first.
2. Create the screen skeleton with Scaffold + AppBar.
3. Create the provider/BLoC.
4. Wire up loading / error / data states.
5. Build the UI widgets last.

### When building a widget
1. Start with const constructor.
2. Define props with required/optional clearly.
3. Build for light mode first, verify dark mode after.
4. Check on small screen (320px) and large screen (428px).
5. Add Semantics labels for accessibility.

### Pull request checklist
- [ ] No hardcoded colors or text styles
- [ ] No hardcoded strings (use AppStrings or l10n)
- [ ] All widgets have const constructors where possible
- [ ] Dark mode tested
- [ ] No print() statements (use logger)
- [ ] No TODO comments without a ticket reference
- [ ] New widgets have widget tests