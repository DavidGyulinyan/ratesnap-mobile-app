# ExRatio - Real-time Currency Converter 📱

A modern, user-friendly mobile currency converter app built with React Native and Expo. Get real-time exchange rates for 160+ currencies with a clean, intuitive interface.

![ExRatio Preview](https://via.placeholder.com/300x600/2563eb/ffffff?text=ExRatio+App)

## ✨ Features

- **Real-time Currency Conversion** - Live exchange rates updated hourly
- **160+ Currencies Supported** - Comprehensive currency coverage
- **Interactive Currency Selection** - Search and select currencies with ease
- **Save Favorite Rates** - Store frequently used exchange rates
- **Conversion History** - Track your conversion history locally
- **Cross-Platform** - Works on iOS, Android, and Web
- **Offline Ready** - Local storage for saved rates and history
- **Modern UI** - Clean, responsive design with smooth animations
- **Location Detection** - Automatically detect user's home currency
- **Math Calculator** - Built-in calculator for complex conversions
- **Themed Interface** - Dark/light theme support

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/exratio-mobile.git
   cd exratio-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_URL=https://v6.exchangerate-api.com/v6/
   EXPO_PUBLIC_API_KEY=your_api_key_here
   ```

   Get your free API key from [ExchangeRate-API](https://www.exchangerate-api.com/)

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**

   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Physical Device**: Scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## 📱 Usage

### Basic Conversion
1. Enter the amount you want to convert
2. Tap "From" to select the source currency
3. Tap "To" to select the target currency
4. View the converted amount instantly

### Saving Rates
- Tap "Save This Rate" to store frequently used conversions
- Access saved rates in the expandable "Saved Rates" section
- Tap any saved rate to quickly load it for conversion

### Managing History
- Your conversion history is automatically saved locally
- Recently used currencies appear first in the selection lists

### Location Detection
- The app automatically detects your location and sets your home currency
- You can manually change the home currency in settings
- Currency flags help you quickly identify currencies

### Theme Support
- Toggle between dark and light themes
- Theme preference is saved locally
- Smooth transitions between theme changes

## 🏗️ Project Structure

```
exratio-mobile/
├── app/                    # App screens (file-based routing)
│   ├── _layout.tsx        # Root layout
│   ├── modal.tsx          # Modal screens
│   └── (tabs)/            # Tab navigation
│       ├── _layout.tsx    # Tab layout
│       ├── index.tsx      # Main converter screen
│       └── explore.tsx    # About/Info screen
├── components/            # Reusable components
│   ├── CurrencyConverter.tsx  # Main converter component
│   ├── CurrencyPicker.tsx     # Currency selection modal
│   ├── CurrencyFlag.tsx       # Currency flag display
│   ├── LocationDetection.tsx  # Location-based currency detection
│   ├── MathCalculator.tsx     # Built-in calculator
│   ├── ThemeToggle.tsx        # Theme switcher
│   ├── themed-text.tsx        # Themed text component
│   ├── themed-view.tsx        # Themed view component
│   └── ui/               # UI components
├── stores/               # State management
│   └── presetStore.ts     # App state and settings
├── lib/                  # External integrations
│   ├── supabase.ts          # Supabase client (if needed)
│   └── providers/           # API providers
│       ├── ExchangeRatesAPIProvider.ts
│       ├── ProviderInterface.ts
│       └── RateSnapProvider.ts
├── hooks/               # Custom React hooks
│   ├── use-color-scheme.ts  # Theme detection
│   └── use-theme-color.ts   # Theme colors
├── contexts/            # React contexts
│   └── ThemeContext.tsx     # Theme management
├── constants/           # App constants
│   └── theme.ts            # Theme definitions
├── styles/              # Styling utilities
│   └── theme.ts            # Theme styles
├── utils/                # Utility functions
│   ├── featureFlags.ts   # Feature flag management
│   └── supabaseFallback.ts # Supabase utilities
├── supabase/             # Database configuration (optional)
│   └── migrations/          # Database migration files
├── tests/                # Unit tests
├── assets/              # Images and static assets
└── scripts/             # Utility scripts
```

## 🛠️ Technologies Used

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **Zustand** - Lightweight state management
- **AsyncStorage** - Local data persistence
- **ExchangeRate-API** - Real-time currency data
- **React Navigation** - Navigation system

## 📋 API Reference

This app uses the [ExchangeRate-API](https://www.exchangerate-api.com/) for currency data.

- **Base URL**: `https://v6.exchangerate-api.com/v6/`
- **Endpoints**: Latest rates, conversion rates
- **Update Frequency**: Hourly

### Supported Providers

The app supports multiple exchange rate providers:
- **ExchangeRate-API** (Primary)
- **ExRatio Provider** (Fallback)

Providers can be configured in the settings and will automatically switch if the primary provider is unavailable.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The project includes:
- Unit tests for currency conversion logic
- Component testing with React Testing Library
- Integration tests for the conversion workflow

## 🚀 Deployment

### Building for Production

1. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

2. **Build for Android**
   ```bash
   eas build --platform android
   ```

3. **Build for Web**
   ```bash
   npx expo export:web
   ```

### Environment Variables for Production

Ensure these variables are set in your production environment:
```env
EXPO_PUBLIC_API_KEY=your_production_api_key
EXPO_PUBLIC_API_URL=https://v6.exchangerate-api.com/v6/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation for API changes
- Ensure cross-platform compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ExchangeRate-API](https://www.exchangerate-api.com/) for providing free currency data
- [Expo](https://expo.dev) for the amazing development platform
- [React Native](https://reactnative.dev) community

## 📞 Support

If you have any questions or issues:

- Create an [issue](https://github.com/yourusername/exratio-mobile/issues) on GitHub
- Check the [Terms of Use](https://docs.google.com/document/d/e/2PACX-1vSqgDzlbEnxw-KoCS6ecj_tGzjSlkxDc7bUBMwzor65LKNLTEqzxm4q2iVvStCkmzo4N6dnVlcRGRuo/pub) for app usage guidelines

## 📝 Changelog

### v2.0.0 - Streamlined Release
- **Improved**: Core currency conversion performance
- **Enhanced**: Cleaner, more maintainable codebase
- **Added**: Enhanced theme system with smooth transitions
- **Added**: Location-based currency detection
- **Added**: Built-in calculator functionality

---

**Made with ❤️ for seamless currency conversion**
