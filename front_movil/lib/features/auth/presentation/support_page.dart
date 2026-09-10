import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/auth_scaffold.dart';
import '../../../core/widgets/error_banner.dart';
import '../../../core/widgets/loading_button.dart';

class SupportPage extends StatefulWidget {
  const SupportPage({required this.portalUri, super.key});

  final Uri? portalUri;

  @override
  State<SupportPage> createState() => _SupportPageState();
}

class _SupportPageState extends State<SupportPage> {
  bool _isOpening = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final hasPortal = widget.portalUri != null;
    return AuthScaffold(
      topAction: IconButton(
        onPressed: () => Navigator.of(context).maybePop(),
        tooltip: 'Volver al acceso',
        icon: const Icon(Icons.arrow_back_rounded),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.accentSoft,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(
              Icons.support_agent_outlined,
              color: AppColors.accent,
              size: 32,
              semanticLabel: 'Soporte',
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Soporte web',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.7,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'El acceso de soporte y administración está disponible únicamente en el portal web seguro. No ingreses credenciales administrativas desde esta app móvil.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.muted,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 22),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.warningSoft,
              border: Border.all(color: AppColors.warning),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.lock_outline_rounded,
                  color: AppColors.warning,
                  size: 20,
                  semanticLabel: 'Acceso restringido',
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    hasPortal
                        ? 'Abriremos el portal configurado en el navegador del dispositivo.'
                        : 'El portal seguro todavía no está configurado para esta versión.',
                    style: const TextStyle(
                      color: AppColors.inkSecondary,
                      height: 1.45,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 18),
            ErrorBanner(message: _error!),
          ],
          const SizedBox(height: 24),
          PrimaryButton(
            label: 'Abrir portal seguro',
            icon: Icons.open_in_new_rounded,
            onPressed: hasPortal ? _openPortal : null,
            isLoading: _isOpening,
          ),
          if (!hasPortal) ...[
            const SizedBox(height: 12),
            Text(
              'Solicita al equipo responsable una versión configurada con SUPPORT_PORTAL_URL.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.muted,
                height: 1.45,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _openPortal() async {
    final uri = widget.portalUri;
    if (uri == null || uri.scheme != 'https') {
      return;
    }

    setState(() {
      _isOpening = true;
      _error = null;
    });
    try {
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched && mounted) {
        setState(() {
          _error =
              'No pudimos abrir el portal seguro. Inténtalo nuevamente desde tu navegador.';
        });
      }
    } on Object {
      if (mounted) {
        setState(() {
          _error =
              'No pudimos abrir el portal seguro. Inténtalo nuevamente desde tu navegador.';
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isOpening = false);
      }
    }
  }
}
