from django.contrib.admin.apps import AdminConfig


class LulimiAdminConfig(AdminConfig):
    """Swaps in the branded admin site.

    Listed in INSTALLED_APPS in place of 'django.contrib.admin', so every
    existing @admin.register decorator registers against it unchanged.
    """

    default_site = 'lulimi_connect.admin_site.LulimiAdminSite'
