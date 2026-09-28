from django.urls import path

from .views import CheckoutView, ConfirmPaymentView, MyPaymentsView, TeacherEarningsView

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='payment-checkout'),
    path('<str:reference>/confirm/', ConfirmPaymentView.as_view(), name='payment-confirm'),
    path('mine/', MyPaymentsView.as_view(), name='payment-mine'),
    path('earnings/', TeacherEarningsView.as_view(), name='teacher-earnings'),
]
