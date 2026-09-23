class MobileWorkspaceMetric {
  const MobileWorkspaceMetric({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final String icon;
}

class MobileWorkspaceItem {
  const MobileWorkspaceItem({
    required this.title,
    required this.subtitle,
    required this.status,
  });

  final String title;
  final String subtitle;
  final String status;
}

class MobileWorkspaceModule {
  const MobileWorkspaceModule({
    required this.label,
    required this.helper,
    required this.icon,
  });

  final String label;
  final String helper;
  final String icon;
}

class MobileWorkspaceSnapshot {
  const MobileWorkspaceSnapshot({
    required this.roleTitle,
    required this.headline,
    required this.helper,
    required this.metrics,
    required this.items,
    required this.modules,
    required this.generatedAt,
  });

  final String roleTitle;
  final String headline;
  final String helper;
  final List<MobileWorkspaceMetric> metrics;
  final List<MobileWorkspaceItem> items;
  final List<MobileWorkspaceModule> modules;
  final DateTime generatedAt;
}
