package br.com.ensinomeu.instituto;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Message;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

/** Aplicativo Android do Instituto EnsinoMeu. A plataforma continua hospedada no site oficial. */
public final class MainActivity extends Activity {
    private static final String HOME = "https://cincoregioes-star.github.io/instituto-ensinomeu/";
    private static final String DOMAIN = "cincoregioes-star.github.io";
    private static final String BASE_PATH = "/instituto-ensinomeu/";
    private static final int FILE_PICKER_REQUEST = 1201;
    private static final int NAVY = Color.rgb(5, 45, 76);

    private FrameLayout root;
    private WebView webView;
    private ProgressBar progressBar;
    private LinearLayout offlinePanel;
    private View videoView;
    private WebChromeClient.CustomViewCallback videoCallback;
    private android.webkit.ValueCallback<Uri[]> fileCallback;
    private boolean mainPageFailed = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(NAVY);
        getWindow().setNavigationBarColor(Color.rgb(6, 31, 55));

        root = new FrameLayout(this);
        root.setBackgroundColor(NAVY);
        setContentView(root);
        applyInsets();

        webView = new WebView(this);
        webView.setBackgroundColor(Color.WHITE);
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.rgb(0, 122, 84)));
        progressBar.setProgressBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.TRANSPARENT));
        root.addView(progressBar, new FrameLayout.LayoutParams(-1, dp(3), Gravity.TOP));

        createOfflinePanel();
        configureWebView();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(HOME);
        }
    }

    private int dp(float value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    /** Preserva a área segura em Android 15+, inclusive com a tela em recorte. */
    private void applyInsets() {
        if (Build.VERSION.SDK_INT < 35 || root == null) return;
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            if (videoView != null) {
                view.setPadding(0, 0, 0, 0);
            } else {
                android.graphics.Insets bars = insets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            }
            return insets;
        });
        root.requestApplyInsets();
    }

    private void createOfflinePanel() {
        offlinePanel = new LinearLayout(this);
        offlinePanel.setOrientation(LinearLayout.VERTICAL);
        offlinePanel.setGravity(Gravity.CENTER);
        offlinePanel.setPadding(dp(28), dp(28), dp(28), dp(28));
        offlinePanel.setBackgroundColor(Color.rgb(244, 249, 251));
        offlinePanel.setVisibility(View.GONE);

        TextView title = new TextView(this);
        title.setText(R.string.offline_title);
        title.setTextColor(NAVY);
        title.setTextSize(25);
        title.setGravity(Gravity.CENTER);
        title.setTypeface(null, android.graphics.Typeface.BOLD);
        offlinePanel.addView(title);

        TextView message = new TextView(this);
        message.setText(R.string.offline_message);
        message.setTextColor(Color.rgb(58, 88, 101));
        message.setTextSize(16);
        message.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams messageParams = new LinearLayout.LayoutParams(-1, -2);
        messageParams.setMargins(0, dp(15), 0, dp(24));
        offlinePanel.addView(message, messageParams);

        Button retry = new Button(this);
        retry.setText(R.string.retry);
        retry.setTextColor(Color.WHITE);
        retry.setAllCaps(false);
        retry.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(4, 116, 86)));
        retry.setOnClickListener(v -> webView.reload());
        offlinePanel.addView(retry, new LinearLayout.LayoutParams(-1, dp(52)));

        root.addView(offlinePanel, new FrameLayout.LayoutParams(-1, -1));
    }

    private boolean belongsToInstitute(Uri uri) {
        return "https".equalsIgnoreCase(uri.getScheme())
                && DOMAIN.equalsIgnoreCase(uri.getHost())
                && uri.getPath() != null
                && (uri.getPath().equals("/instituto-ensinomeu") || uri.getPath().startsWith(BASE_PATH));
    }

    private void openOutside(Uri uri) {
        String scheme = uri.getScheme();
        if (scheme == null || !(scheme.equalsIgnoreCase("https") || scheme.equalsIgnoreCase("http")
                || scheme.equalsIgnoreCase("mailto") || scheme.equalsIgnoreCase("tel"))) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE));
        } catch (ActivityNotFoundException ignored) {
            // Sem aplicativo instalado para abrir este tipo de link.
        }
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        if (Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        webView.setDownloadListener((url, agent, disposition, mimeType, size) -> {
            try { openOutside(Uri.parse(url)); } catch (Exception ignored) {}
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                Uri uri = request.getUrl();
                if (belongsToInstitute(uri)) {
                    String path = uri.getPath();
                    if (path != null && (path.toLowerCase().endsWith(".pdf") || path.toLowerCase().endsWith(".zip"))) {
                        openOutside(uri);
                        return true;
                    }
                    return false;
                }
                openOutside(uri);
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                mainPageFailed = false;
                offlinePanel.setVisibility(View.GONE);
                progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
                if (!mainPageFailed) offlinePanel.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    mainPageFailed = true;
                    offlinePanel.setVisibility(View.VISIBLE);
                    progressBar.setVisibility(View.GONE);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int progress) {
                progressBar.setProgress(progress);
                if (progress >= 100) progressBar.setVisibility(View.GONE);
            }

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (videoView != null) {
                    callback.onCustomViewHidden();
                    return;
                }
                videoView = view;
                videoCallback = callback;
                webView.setVisibility(View.GONE);
                offlinePanel.setVisibility(View.GONE);
                progressBar.setVisibility(View.GONE);
                root.addView(view, new FrameLayout.LayoutParams(-1, -1));
                getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
                applyInsets();
            }

            @Override
            public void onHideCustomView() {
                closeVideo();
            }

            @Override
            public boolean onShowFileChooser(WebView view, android.webkit.ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    Intent chooser = params.createIntent();
                    startActivityForResult(chooser, FILE_PICKER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException ignored) {
                    fileCallback = null;
                    return false;
                }
            }
        });
    }

    private void closeVideo() {
        if (videoView == null) return;
        root.removeView(videoView);
        videoView = null;
        webView.setVisibility(View.VISIBLE);
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        applyInsets();
        if (videoCallback != null) videoCallback.onCustomViewHidden();
        videoCallback = null;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_PICKER_REQUEST && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            fileCallback = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (videoView != null) {
            closeVideo();
        } else if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onDestroy() {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        if (videoView != null) closeVideo();
        root.removeView(webView);
        webView.destroy();
        super.onDestroy();
    }
}
