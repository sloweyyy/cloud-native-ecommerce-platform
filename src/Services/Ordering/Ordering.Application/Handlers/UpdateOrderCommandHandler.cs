using Common.Mediator;
using Ordering.Application.Mappers;
using Microsoft.Extensions.Logging;
using Ordering.Application.Commands;
using Ordering.Application.Exceptions;
using Ordering.Core.Entities;
using Ordering.Core.Repositories;

namespace Ordering.Application.Handlers;

public class UpdateOrderCommandHandler : IRequestHandler<UpdateOrderCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly OrderMapper _mapper;
    private readonly ILogger<UpdateOrderCommandHandler> _logger;

    public UpdateOrderCommandHandler(IOrderRepository orderRepository, OrderMapper mapper,
        ILogger<UpdateOrderCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Unit> Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
    {
        var orderToUpdate = await _orderRepository.GetByIdAsync(request.Id);
        if (orderToUpdate == null) throw new OrderNotFoundException(nameof(Order), request.Id);
        _mapper.UpdateOrder(request, orderToUpdate);
        await _orderRepository.UpdateAsync(orderToUpdate);
        _logger.LogInformation($"Order {orderToUpdate.Id} is successfully updated");
        return Unit.Value;
    }
}