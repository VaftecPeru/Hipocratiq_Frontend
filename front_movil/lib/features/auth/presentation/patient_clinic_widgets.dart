part of 'patient_registration_page.dart';

class _ClinicLoading extends StatelessWidget {
  const _ClinicLoading();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      label: 'Cargando clínicas disponibles',
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: ExcludeSemantics(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              SizedBox.square(
                dimension: 22,
                child: CircularProgressIndicator(strokeWidth: 2.5),
              ),
              SizedBox(width: 12),
              Text('Cargando clínicas disponibles…'),
            ],
          ),
        ),
      ),
    );
  }
}

class _ClinicFieldTrigger extends StatelessWidget {
  const _ClinicFieldTrigger({required this.onOpen, this.errorText});

  final VoidCallback onOpen;
  final String? errorText;

  @override
  Widget build(BuildContext context) {
    final hasError = errorText != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        OutlinedButton(
          onPressed: onOpen,
          style: OutlinedButton.styleFrom(
            alignment: Alignment.centerLeft,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            side: BorderSide(
              color: hasError ? AppColors.danger : AppColors.line,
              width: hasError ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              const ExcludeSemantics(child: Icon(Icons.business_outlined)),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Clínica',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    SizedBox(height: 2),
                    Text('Selecciona una clínica'),
                  ],
                ),
              ),
              const ExcludeSemantics(child: Icon(Icons.expand_more_rounded)),
            ],
          ),
        ),
        if (errorText != null)
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, top: 4),
            child: Semantics(
              liveRegion: true,
              label: 'Error: $errorText',
              child: ExcludeSemantics(
                child: Text(
                  errorText!,
                  style: Theme.of(context).inputDecorationTheme.errorStyle,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _ClinicsUnavailable extends StatelessWidget {
  const _ClinicsUnavailable({
    required this.message,
    required this.onRetry,
    this.isError = false,
  });

  final String message;
  final VoidCallback onRetry;
  final bool isError;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.warningSoft,
        border: Border.all(color: AppColors.warning),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Semantics(
            liveRegion: isError,
            label: isError ? 'Error: $message' : message,
            child: ExcludeSemantics(
              child: Text(
                message,
                style: const TextStyle(
                  color: AppColors.ink,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'El registro de paciente se habilitará cuando exista una clínica disponible.',
            style: TextStyle(color: AppColors.inkSecondary, height: 1.4),
          ),
          const SizedBox(height: 8),
          TextButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Reintentar'),
          ),
        ],
      ),
    );
  }
}
