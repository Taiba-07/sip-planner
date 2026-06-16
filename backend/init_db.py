from database import engine, Base
import models  # noqa: F401 — imports register the models with Base

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done! Tables created: users, portfolio_items, goals")