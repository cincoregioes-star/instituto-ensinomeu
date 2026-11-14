# Instituto EnsinoMeu — aplicativo Android

O projeto contém uma interface Android nativa (`WebView`) para o portal oficial:

https://cincoregioes-star.github.io/instituto-ensinomeu/

Preserva a navegação, os formulários e os simulados da plataforma publicada. Inclui botão de voltar do Android, vídeos em tela cheia, seleção de arquivos e abertura de PDFs/ZIPs no navegador. Nenhuma senha ou credencial do Instituto é compilada no APK.

## APK de teste

O workflow `.github/workflows/gerar-apk-ensinomeu.yml` gera `app-debug.apk` no GitHub Actions, com o nome `Instituto-EnsinoMeu-APK-Android-TESTE`. O arquivo é assinado automaticamente pela chave de **depuração**, própria para testes.

Ele não é uma versão destinada à Play Store nem uma versão final de distribuição pública. Para atualizações consistentes e publicação, é necessário criar uma **chave de assinatura de release**, mantê-la sob controle do titular, e assinar os APKs futuros com a mesma chave.

## Compilar localmente

Abra a pasta `android-app` no Android Studio ou execute `gradle assembleDebug` com Java 17, Android SDK 35 e Gradle 8.13 instalados.

Identificação do pacote: `br.com.ensinomeu.instituto`.

Versão inicial: `1.0.0` (código `1`).

O APK requer Android 7.0 ou superior e conexão para a maior parte dos conteúdos. O PWA e o site continuam funcionando independentemente deste APK.
