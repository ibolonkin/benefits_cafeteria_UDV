from sqlalchemy.orm import Mapped, mapped_column

from src.base import Base


class HistoryUserBenefits(Base):
    __tablename__ = 'stat_history_user_benefits'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_Fio: Mapped[str] = mapped_column(index=True)

    user_email: Mapped[str] = mapped_column(index=True, nullable=True)

    user_legal_entity: Mapped[str] = mapped_column(nullable=True)
    user_job_title: Mapped[str] = mapped_column(nullable=True)
    benefit_name: Mapped[str] = mapped_column(index=True)

    status: Mapped[str] = mapped_column(index=True)

    ucoin: Mapped[int] = mapped_column()

    price: Mapped[int] = mapped_column()

    def to_dict(self):
        status_update = {
            'Approved': "Одобренно",
            'Pending': "Заявка отправлена",
            'Denied': 'Отказано'
        }

        return {'Имя пользователя': self.user_Fio,
                'Юр лицо': self.user_legal_entity,
                'Должность': self.user_job_title,
                'Почта':self.user_email,
                'Название бенефита': self.benefit_name,
                "Статус": status_update.get(self.status),
                "Потрачено компанией": self.price if self.price else '',
                'Потрачено пользователем Ucoin': self.ucoin if self.ucoin else '',
                "Дата": self.create_at}


class HistoryBenefits(Base):
    __tablename__ = 'stat_history_benefits'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    benefit_name: Mapped[str] = mapped_column(index=True)
    status: Mapped[str] = mapped_column(index=True)
