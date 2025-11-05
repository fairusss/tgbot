from django.core.management.base import BaseCommand
import threading
from bot.bot_instance import bot

class Command(BaseCommand):
    help = 'Запускає Telegram-бота разом із Django'

    def handle(self, *args, **kwargs):
        self.stdout.write("Бот запущено! Очікуємо дані...")
        bot.infinity_polling()
