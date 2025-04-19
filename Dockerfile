# Build stage - Install Python dependencies
FROM python:3.9-slim as backend
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3-distutils && \
    rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend .

# Runtime configuration
ENV PORT=5000
EXPOSE $PORT
# Step 7: Command to run the application with gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]

